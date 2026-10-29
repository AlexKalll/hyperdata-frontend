import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialogLeft";
import { Button } from "@/components/ui/button";
import { Plus, Upload, FileAudio } from "lucide-react";
import * as XLSX from "xlsx";
import { projectTaskasAll, projectTaskasRelated } from "@/lib/hooks/useProject";
import {
  TaskResponse,
  TaskResponseData,
  ProjectTask,
} from "@/app/types/project";
import { toast } from "sonner";

interface AddMicroTaskDialogProps {
  tasks: TaskResponse[];
  taskMetadata: TaskResponseData;
  onSubmitSingle: (formData: {
    instruction: string;
    text: string;
    taskId: string;
    is_test: boolean;
    audioFiles?: File[];
  }) => void;
  onSubmitCsv: (uploadData: { file: File }) => void;
  onSubmitTask: (formData: {
    taskId: string;
    source_task_id: string;
    from_micro_task: boolean;
    from_data_set: boolean;
    limit: number | null;
  }) => void;
  onSubmitAudio: (uploadData: {
    files: File[];
    is_test: boolean;
    instruction: string;
  }) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CsvRow {
  no: string;
  text: string;
}

const AddMicroTaskDialog: React.FC<AddMicroTaskDialogProps> = ({
  tasks,
  taskMetadata,
  onSubmitSingle,
  onSubmitCsv,
  onSubmitTask,
  onSubmitAudio,
  open,
  setOpen,
}) => {
  const [activeTab, setActiveTab] = useState<
    "Single" | "CsvUpload" | "ImportTask"
  >("Single");
  const [singleFormData, setSingleFormData] = useState({
    instruction: "",
    text: "",
    taskId: "",
    is_test: false,
  });

  const { data: projectTaskData } = projectTaskasRelated({
    task_id: taskMetadata.id,
  });

  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [source_task_id, setsource_task_id] = useState("");
  const [limit, setLimit] = useState("");
  const [from_micro_task, setfrom_micro_task] = useState(true);
  const [from_data_set, setfrom_data_set] = useState(false);

  // File size limits
  const MAX_CSV_SIZE = 7 * 1024 * 1024; // 7 MB
  const MAX_AUDIO_SIZE = 7 * 1024 * 1024; // 70MB

  const handleSwitchChange = (type: "microTask" | "dataSet") => {
    if (type === "microTask") {
      setfrom_micro_task(true);
      setfrom_data_set(false);
    } else {
      setfrom_micro_task(false);
      setfrom_data_set(true);
    }
  };

  // Reusable file size validator
  const validateFileSize = (file: File, type: "csv" | "audio"): boolean => {
    const maxSize = type === "audio" ? MAX_AUDIO_SIZE : MAX_CSV_SIZE;
    const maxSizeMB = type === "audio" ? 50 : 10;

    if (file.size > maxSize) {
      toast.error(
        `${type === "csv" ? "CSV/XLSX/TXT" : "Audio"} file is too large. Maximum allowed: ${maxSizeMB}MB`
      );
      return false;
    }
    return true;
  };

  // Parse CSV, XLSX, or line-by-line text files.
  useEffect(() => {
    if (!csvFile) {
      setCsvData([]);
      setCsvError(null);
      return;
    }

    const fileExtension = csvFile.name.split(".").pop()?.toLowerCase();

    if (!["csv", "xlsx", "txt"].includes(fileExtension || "")) {
      setCsvError("Please upload a valid .csv, .xlsx, or .txt file");
      setCsvData([]);
      return;
    }

    const isText = fileExtension === "txt";
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let data: unknown[][];
        if (isText) {
          data = String(e.target?.result || "")
            .replace(/^\uFEFF/, "")
            .split(/\r\n|\n|\r/)
            .map((line) => [line]);
        } else {
          const workbook = XLSX.read(
            new Uint8Array(e.target?.result as ArrayBuffer),
            { type: "array", codepage: 65001, raw: true }
          );
          data = XLSX.utils.sheet_to_json<unknown[]>(
            workbook.Sheets[workbook.SheetNames[0]],
            { header: 1, defval: "", blankrows: false }
          );
        }
        data = data.filter((row) =>
          row.some((value) => String(value ?? "").trim())
        );
        const headers = (data[0] || []).map((value) =>
          String(value ?? "").trim().toLowerCase()
        );
        const hasHeaders = !isText && headers.includes("text");
        const textColumn = headers.indexOf("text");
        const noColumn = headers.indexOf("no");
        const rows = (hasHeaders ? data.slice(1) : data)
          .map((row, index) => {
            const numbered =
              row.length > 1 && /^\d+$/.test(String(row[0] ?? "").trim());
            const number = hasHeaders ? row[noColumn] : numbered ? row[0] : undefined;
            return {
              no: String(number ?? "").trim() || String(index + 1),
              text: String(row[hasHeaders ? textColumn : numbered ? 1 : 0] ?? ""),
            };
          })
          .filter((row) => row.text.trim());
        setCsvData(rows);
        setCsvError(rows.length ? null : "No valid rows found in the file");
      } catch (error) {
        setCsvError(`Error parsing file: ${(error as Error).message}`);
        setCsvData([]);
      }
    };
    reader.onerror = () => {
      setCsvError("Failed to read file");
      setCsvData([]);
    };
    if (isText) {
      reader.readAsText(csvFile);
    } else {
      reader.readAsArrayBuffer(csvFile);
    }
  }, [csvFile]);

  // Reset CSV state when tab changes or dialog closes
  useEffect(() => {
    if (!open || activeTab !== "CsvUpload") {
      setCsvFile(null);
      setCsvData([]);
      setCsvError(null);
    }
  }, [open, activeTab]);

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleFormData.text && audioFiles.length === 0) {
      toast.error("Please provide text or upload audio files");
      return;
    }
    onSubmitSingle({ ...singleFormData, audioFiles: audioFiles.length > 0 ? audioFiles : undefined });
    setSingleFormData({
      instruction: "",
      text: "",
      taskId: "",
      is_test: false,
    });
    setAudioFiles([]);
    setOpen(false);
  };

  const handleCsvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (csvFile && csvData.length > 0 && !csvError) {
      onSubmitCsv({ file: csvFile });
      setCsvFile(null);
      setCsvData([]);
      setCsvError(null);
      setOpen(false);
    } else {
      toast.error("Please upload a valid CSV/XLSX/TXT file with data");
    }
  };

  const handleAudioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (audioFiles.length === 0) {
      toast.error("Please upload audio files");
      return;
    }
    onSubmitAudio({
      files: audioFiles,
      is_test: singleFormData.is_test,
      instruction: singleFormData.instruction,
    });
    setAudioFiles([]);
    setSingleFormData({ ...singleFormData, instruction: "" });
    setOpen(false);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source_task_id) {
      toast.error("Please select a task to import from");
      return;
    }
    onSubmitTask({
      taskId: taskMetadata.id,
      source_task_id,
      from_micro_task,
      from_data_set,
      limit: limit ? parseInt(limit) : null,
    });
    setsource_task_id("");
    setLimit("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-white hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Micro Task
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[650px] h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <p className="mb-4 font-bold text-lg">Add Micro Task</p>
        </DialogHeader>
        <DialogTitle />

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6 flex-shrink-0">
          <nav className="flex space-x-6">
            {["Single", "CsvUpload", "ImportTask"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "Single" && "Single Micro Task"}
                {tab === "CsvUpload" && "From CSV/XLSX/TXT"}
                {tab === "ImportTask" && "Import from Task"}
              </button>
            ))}
          </nav>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto pr-2">
          {/* === Single Micro Task === */}
          {activeTab === "Single" && (
            <form
              onSubmit={
                taskMetadata?.taskType?.task_type === "text-text" ||
                taskMetadata?.taskType?.task_type === "text-audio" 
                  ? handleSingleSubmit
                  : handleAudioSubmit
              }
              className="space-y-5"
            >
              {taskMetadata?.taskType?.task_type === "text-text" ||
              taskMetadata?.taskType?.task_type === "text-audio" ? (
                <>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Text *
                    </label>
                    <textarea
                      value={singleFormData.text}
                      onChange={(e) =>
                        setSingleFormData({
                          ...singleFormData,
                          text: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-vertical"
                      rows={5}
                      placeholder="Enter the text content..."
                      required
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Audio File *
                  </label>
                  <input
                    type="file"
                    accept="audio/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 5) {
                        toast.error("Maximum 5 audio files allowed");
                        e.target.value = "";
                        return;
                      }
                      if (files.length > 0) {
                        const validFiles = files.filter(file => validateFileSize(file, "audio"));
                        if (validFiles.length > 0) {
                          setAudioFiles(validFiles);
                        } else {
                          setAudioFiles([]);
                          e.target.value = "";
                        }
                      } else {
                        setAudioFiles([]);
                        e.target.value = "";
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    required
                  />
                  {audioFiles.length > 0 && (
                    <div className="text-sm text-green-600 mt-2">
                      <p className="font-medium">Selected {audioFiles.length}/5 file(s):</p>
                      <ul className="list-disc list-inside ml-2 max-h-32 overflow-y-auto">
                        {audioFiles.map((file, index) => (
                          <li key={index} className="flex items-center justify-between">
                            <span>
                              <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const newFiles = audioFiles.filter((_, i) => i !== index);
                                setAudioFiles(newFiles);
                              }}
                              className="ml-2 text-red-500 hover:text-red-700 text-xs"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Max size: 50MB per file • Max files: 5 • Formats: MP3, WAV, etc.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Instruction
                </label>
                <textarea
                  value={singleFormData.instruction}
                  onChange={(e) =>
                    setSingleFormData({
                      ...singleFormData,
                      instruction: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-vertical"
                  rows={4}
                  placeholder="Optional instructions for contributors..."
                />
              </div>

              {taskMetadata?.require_contributor_test && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={singleFormData.is_test}
                    onChange={(e) =>
                      setSingleFormData({
                        ...singleFormData,
                        is_test: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Mark as test task</span>
                </label>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                >
                  Create Micro Task
                </Button>
              </div>
            </form>
          )}

          {/* === CSV/XLSX Upload === */}
          {activeTab === "CsvUpload" &&
            (taskMetadata?.taskType?.task_type === "text-text" ||
              taskMetadata?.taskType?.task_type === "text-audio" ||
              taskMetadata?.taskType?.task_type === "audio-text") && (
              <form onSubmit={handleCsvSubmit} className="space-y-5">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Upload CSV, XLSX, or TXT File *
                  </label>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.txt,text/csv,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    multiple={false}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file && validateFileSize(file, "csv")) {
                        setCsvFile(file);
                        setCsvError(null);
                      } else {
                        setCsvFile(null);
                        setCsvData([]);
                        setCsvError(null);
                        e.target.value = "";
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {csvFile && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected: <strong>{csvFile.name}</strong> (
                      {(csvFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Max size: 10MB • Optional headers:{" "}
                    <code className="bg-gray-100 px-1 rounded">no</code>,{" "}
                    <code className="bg-gray-100 px-1 rounded">text</code>{" "}
                    (case-insensitive)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Without headers, use one text column or numbered text rows.
                    TXT files use one microtask per non-empty line.
                  </p>
                  {csvError && (
                    <p className="text-sm text-red-600 mt-2">{csvError}</p>
                  )}
                </div>

                {csvData.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Preview ({csvData.length} rows)
                    </h4>
                    <div className="overflow-x-auto max-h-64 border rounded">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left">No</th>
                            <th className="px-3 py-2 text-left">Text</th>
                          </tr>
                        </thead>
                        <tbody>
                          {csvData.slice(0, 10).map((row, i) => (
                            <tr key={i} className="border-t">
                              <td className="px-3 py-2">
                                {row.no}
                              </td>
                              <td className="px-3 py-2 max-w-md truncate">
                                {row.text}
                              </td>
                            </tr>
                          ))}
                          {csvData.length > 10 && (
                            <tr>
                              <td
                                colSpan={2}
                                className="px-3 py-2 text-center text-gray-500 italic"
                              >
                                ... and {csvData.length - 10} more rows
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!csvFile || csvData.length === 0 || !!csvError}
                    className="bg-primary hover:bg-primary/90 disabled:opacity-50"
                  >
                    Upload and Create
                  </Button>
                </div>
              </form>
            )}

          {/* === Import from Task === */}
          {activeTab === "ImportTask" && (
            <form onSubmit={handleImportSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Select Task to Import From
                </label>
                <select
                  value={source_task_id}
                  onChange={(e) => setsource_task_id(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Choose a task...</option>
                  {(Array.isArray(projectTaskData?.data)
                    ? (projectTaskData?.data ?? [])
                    : []
                  ).map((task: any) => (
                    <option key={task.id} value={task.id}>
                      {task.name} ({task.taskType?.task_type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={from_micro_task}
                    onChange={() => handleSwitchChange("microTask")}
                    className="text-blue-600"
                  />
                  <span>From MicroTasks</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={from_data_set}
                    onChange={() => handleSwitchChange("dataSet")}
                    className="text-blue-600"
                  />
                  <span>From Dataset</span>
                </label>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Limit (optional)
                </label>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  min="1"
                  placeholder="e.g., 100"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to import all
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!source_task_id}
                  className="bg-primary hover:bg-primary/90"
                >
                  Import Microtasks
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddMicroTaskDialog;
