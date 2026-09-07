const assert = require("node:assert/strict");
const { readFileSync, existsSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const read = (file) => readFileSync(path.join(root, file), "utf8");
const transpile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText;

function variableInitializer(file, name) {
  const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let initializer;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === name) initializer = node.initializer.getText(source);
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.ok(initializer, `Missing ${name} in ${file}`);
  return initializer;
}

test("task creation keeps reviewer days and converts contributor days only once across failed retries", async () => {
  const handler = variableInitializer("src/app/components/projectManager/createTaskForm.tsx", "handleSubmit");
  const formData = { name: "Task fixture", contributor_completion_time_limit: 2, reviewer_completion_time_limit: 3 };
  const original = { ...formData };
  const submissions = [];
  const resets = [];
  const loading = [];
  const submit = vm.runInNewContext(transpile(`const submit = ${handler}; submit;`), {
    formData,
    validateStep: () => true,
    setIsSubmitting: value => loading.push(value),
    onSubmit: async data => {
      submissions.push(JSON.parse(JSON.stringify(data)));
      if (submissions.length < 3) throw new Error("Request failed");
    },
    projectId: "project-id",
    setFormData: () => resets.push("form"),
    setErrors() {},
    onCancel: () => resets.push("close"),
  });
  for (let attempt = 0; attempt < 2; attempt++) {
    await assert.rejects(submit(), /Request failed/);
    assert.deepEqual(formData, original);
    assert.deepEqual(resets, []);
  }
  await submit();
  assert.deepEqual(submissions, Array.from({ length: 3 }, () => ({ ...original, contributor_completion_time_limit: 48 })));
  assert.deepEqual(formData, original);
  assert.deepEqual(resets, ["form", "close"]);
  assert.deepEqual(loading, [true, false, true, false, true, false]);
});

for (const reviewerDays of [1, 24, null]) {
  test(`task edit preserves persisted reviewer days (${reviewerDays}) and contributor hours`, async () => {
    const file = "src/app/components/projectManager/updateTaskForm.tsx";
    const task = { id: "task-id", taskRequirement: {}, reviewer_completion_time_limit: reviewerDays, contributor_completion_time_limit: 48 };
    const [formData] = vm.runInNewContext(transpile(`const state = ${variableInitializer(file, "[formData, setFormData]")}; state;`), {
      task,
      useState: value => [value],
    });
    assert.equal(formData.reviewer_completion_time_limit, reviewerDays);
    assert.equal(formData.contributor_completion_time_limit, 2);
    const requests = [];
    const mutation = vm.runInNewContext(transpile(`const mutation = ${variableInitializer(file, "updateTaskMutation")}; mutation;`), {
      useMutation: options => options,
      session: { access_token: "test-token" },
      process: { env: { NEXT_PUBLIC_API_BASE_URL: "https://api.example.test/api" } },
      isTextAudio: false,
      axios: { put: async (...args) => { requests.push(args); return { data: {} }; } },
    });
    await mutation.mutationFn(formData);
    assert.equal(requests[0][0], "https://api.example.test/api/project-mgmt/task/task-id/requirement");
    assert.equal(requests[0][1].reviewer_completion_time_limit, reviewerDays);
    assert.equal(requests[0][1].contributor_completion_time_limit, 48);
    assert.equal(formData.contributor_completion_time_limit, 2);
    assert.equal(task.reviewer_completion_time_limit, reviewerDays);
  });
}

// Exercise the actual mutation functions without mounting React or calling a live API.
function loadHooks(file, token = "test-token") {
  const requests = [];
  const request = async (...args) => {
    requests.push(JSON.parse(JSON.stringify(args)));
    return { data: { success: true } };
  };
  const mocks = {
    axios: { put: request, post: request },
    sonner: { toast: { success() {}, error() {} } },
    "next-auth/react": { useSession: () => ({ data: { access_token: token } }) },
    "@tanstack/react-query": {
      useMutation: (options) => options,
      useQueryClient: () => ({ invalidateQueries() {} }),
    },
  };
  const exports = {};
  vm.runInNewContext(transpile(read(file)), {
    exports,
    process: { env: { NEXT_PUBLIC_API_BASE_URL: "https://api.example.test/api" } },
    require: (name) => {
      assert.ok(name in mocks, `Unexpected dependency: ${name}`);
      return mocks[name];
    },
  });
  return { hooks: exports, requests };
}

for (const [hook, action, input, body] of [
  ["useApprove", "approve", { annotation_id: "annotation-id", annotation: "Correct" }, { annotation: "Correct" }],
  ["useFlagMicrotask", "flag", { flag_type_id: "flag-id", comment: "Check audio" }, { flag_type_id: "flag-id", comment: "Check audio" }],
  ["useRejectionMicrotask", "reject", { rejection_type_ids: ["reason-id"], comment: "Noise", flag: false }, { rejection_type_ids: ["reason-id"], comment: "Noise", flag: false }],
]) {
  test(`${action} preserves the URL ID and sends only supported body fields`, async () => {
    const { hooks, requests } = loadHooks("src/lib/hooks/useReviewer.ts");
    await hooks[hook]().mutationFn({ microTaskId: "dataset-id", ...input });
    assert.deepEqual(requests, [[
      `https://api.example.test/api/workspace/data-set/${action}/dataset-id`,
      body,
      { headers: { Authorization: "Bearer test-token" } },
    ]]);
  });
}

test("approval without authentication does not send a request", async () => {
  const { hooks, requests } = loadHooks("src/lib/hooks/useReviewer.ts", null);
  await assert.rejects(hooks.useApprove().mutationFn({ microTaskId: "dataset-id", annotation: "Correct" }), /No authentication token/);
  assert.equal(requests.length, 0);
});

test("withdrawal serializes the form amount as a JSON number", async () => {
  const { hooks, requests } = loadHooks("src/lib/hooks/usePayment.ts");
  await hooks.useWithdrawMoney().mutationFn({ paymentMethod: "Telebirr", phoneNumber: "+251912345678", amount: "12.50" });
  assert.deepEqual(requests, [[
    "https://api.example.test/api/wallet/withdraw-money",
    { paymentMethod: "Telebirr", phoneNumber: "+251912345678", amount: 12.5 },
    { headers: { Authorization: "Bearer test-token" } },
  ]]);
});

for (const [submit, mutation, hook, successEffects] of [
  ["submitApproval", "approveMutation", "appproveMicrotask", [["setIsApproveDialogOpen", false], ["setSelectedAnnotationId", ""], ["advance"], ["setIsRejectFlag", false]]],
  ["submitRejection", "rejectMutation", "RejectMicrotask", [["setIsRejectDialogOpen", false], ["setSelectedRejectionReasonIds", []], ["setRejectionComment", ""], ["advance"], ["setIsRejectFlag", false]]],
  ["submitFlag", "flagMutation", "flagMicrotask", [["setIsFlagDialogOpen", false], ["setSelectedFlagTypeId", ""], ["setFlagComment", ""], ["advance"]]],
]) {
  for (const succeeds of [true, false]) {
    test(`${submit} preserves selection and dialogs until success (${succeeds ? "resolved" : "rejected"})`, async () => {
      const source = ts.createSourceFile("review.tsx", read("src/app/components/reviewer/microTaskList.tsx"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const declarations = [];
      function visit(node) {
        if (ts.isVariableDeclaration(node) && [submit, mutation].includes(node.name.getText(source))) {
          declarations.push(`const ${node.getText(source)};`);
        }
        ts.forEachChild(node, visit);
      }
      visit(source);
      assert.equal(declarations.length, 2);
      const effects = [];
      const errors = [];
      let resolveRequest;
      let rejectRequest;
      const pending = new Promise((resolve, reject) => {
        resolveRequest = resolve;
        rejectRequest = reject;
      });
      const context = {
        selectedMicroTaskId: "dataset-id",
        selectedAnnotationId: "annotation-id",
        selectedAnnotationName: "Correct",
        selectedRejectionReasonIds: ["reason-id"],
        rejectionReasons: [],
        rejectionComment: "Review comment",
        isRejectFlag: true,
        selectedFlagTypeId: "flag-id",
        flagTypes: [],
        flagComment: "Flag comment",
        taskId: "task-id",
        microTaskPage: 1,
        microTaskPageSize: 10,
        queryClient: { invalidateQueries() {} },
        toast: { success() {}, error: (...args) => errors.push(args) },
        handlePostMutation: () => effects.push(["advance"]),
        [hook]: { mutateAsync: () => pending },
      };
      for (const name of ["setIsApproveDialogOpen", "setSelectedAnnotationId", "setIsRejectDialogOpen", "setSelectedRejectionReasonIds", "setRejectionComment", "setIsRejectFlag", "setIsFlagDialogOpen", "setSelectedFlagTypeId", "setFlagComment", "setSelectedMicroTaskId", "setIsDialogOpen", "setCurrentRowIndex"]) {
        context[name] = (value) => effects.push([name, JSON.parse(JSON.stringify(value))]);
      }
      const run = vm.runInNewContext(transpile(`${declarations.join("\n")} ${submit};`), context);
      const completion = run();
      assert.deepEqual(effects, [], "Pending requests must not clear selection, close dialogs, or advance");
      if (succeeds) resolveRequest({});
      else rejectRequest(new Error("Review request failed"));
      await completion;
      assert.deepEqual(effects, succeeds ? successEffects : []);
      assert.equal(errors.length, succeeds ? 0 : 1);
    });
  }
}

test("login redirects each supported role to an existing dashboard page", () => {
  const source = ts.createSourceFile("login.tsx", read("src/app/(auth)/login/page.tsx"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let redirect;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === "redirectBasedOnRole") {
      redirect = node.initializer.getText(source);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.ok(redirect, "Role redirect function must exist");
  for (const [role, destination] of [["SuperAdmin", "/superadmin"], ["ProjectManager", "/projectmanager"], ["Facilitator", "/facilitator"], ["Reviewer", "/reviewer"]]) {
    const calls = [];
    let refreshed = false;
    const route = vm.runInNewContext(transpile(`const redirect = ${redirect}; redirect;`), {
      router: { push: (url) => calls.push(url), refresh: () => { refreshed = true; } },
    });
    route(role);
    assert.deepEqual(calls, [destination]);
    assert.equal(refreshed, false, "Refreshing the login route must not compete with navigation");
    assert.ok(existsSync(path.join(root, "src/app/(dashboard)", destination.slice(1), "page.tsx")));
  }
});

for (const role of ["ProjectManager", "Reviewer", "Facilitator", null]) {
  test(`login uses the freshly fetched role without stale-session timers (${role ?? "missing session"})`, async () => {
    const source = ts.createSourceFile("login.tsx", read("src/app/(auth)/login/page.tsx"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    let handler;
    function visit(node) {
      if (ts.isVariableDeclaration(node) && node.name.getText(source) === "handleSubmit") handler = node.initializer.getText(source);
      ts.forEachChild(node, visit);
    }
    visit(source);
    assert.ok(handler);
    const redirects = [];
    const loading = [];
    const errors = [];
    const run = vm.runInNewContext(transpile(`const submit = ${handler}; submit;`), {
      email: "fixture@example.test",
      password: "fixture-password",
      session: null,
      signIn: async () => ({ ok: true }),
      getSession: async () => role ? { user: { role } } : null,
      setLoading: value => loading.push(value),
      redirectBasedOnRole: value => redirects.push(value),
      toast: { success() {}, error: message => errors.push(message) },
      setTimeout: () => assert.fail("Login must not depend on delayed stale session reads"),
    });
    await run({ preventDefault() {} });
    assert.deepEqual(redirects, role ? [role] : []);
    assert.deepEqual(loading, [true, false]);
    assert.equal(errors.length, role ? 0 : 1);
  });
}
