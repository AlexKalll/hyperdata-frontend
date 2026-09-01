export interface NewProjectProject {
  id: string;
  description: string,
  name: string,
  status: "active" | "inactive" | "Active" | "Inactive";
  cover_image_url: string | undefined;
  end_date: string,
  updated_by: string | null,
  created_date: string,
  updated_date: string,
  start_date: string,
  created_by: string,


}
export interface TaskType {
  id: string;
  task_type: string;
  created_by: string | null;
  updated_by: string | null;
  created_date: string;
  updated_date: string;
}

export interface ProjectTask {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  require_contributor_test: boolean;
  is_closed: boolean;
  is_archived: boolean;
  created_by: string;
  updated_by: string | null;
  created_date: string;
  updated_date: string;
  project_id: string;
  task_type_id: string;
  language_id: string;
  taskType: TaskType;
}
export interface ProjectResponse {
  id: string;
  name: string;
  status: "active" | "inactive" | "Active" | "Inactive";
  start_date: string;
  end_date: string;
  description: string;
  manager_id: string;
  image: File | null;
  created_by: string;
  updated_by: string | null;
  created_date: string;
  updated_date: string;
  cover_image_url: string | undefined;
  manager: {
    id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    profile_picture: string;
    birth_date: string;
    gender: string;
    is_active: true;
    created_by: string;
    updated_by: string;
    created_date: string;
    updated_date: string;
    language_id: string;
    dialect_id: string;
    role_id: string;
    woreda: string;
    city: string;
    zone_id: string;
    region_id: string;
  }

  tags?: string[] | null;

}
export interface InvitationLinkResponse {
  id: string;
  invitation_link_id: string;
  organization: string;
  link: string;
  dateCreated: string;
  role: string;
}
export interface TaskInstructions {
  id: string;
  task_id: string;
  title: string;
  content: string;
  image_instruction_url: string | null;
  video_instruction_url: string | null;
  audio_instruction_url: string | null;
  created_by: string;
  updated_by: string | null;
  created_date: string;
  updated_date: string;
}
interface data_sets {
  id: string;
  code: string;
  text_data_set: string;
  status: string;
  is_draft: boolean;
  is_flagged: boolean;
  is_paid_for_contributor: boolean;
  rejection_reason_id: string | null;
  is_paid_for_reviewer: boolean;
  is_test: boolean;
  audio_duration: number | null;
  created_by: string | null;
  updated_by: string | null;
  file_path: string | null;
  type: string;
  created_date: string;
  updated_date: string;
  micro_task_id: string;
  contributor_id: string;
  reviewer_id: string | null;
  dialect_id: string;
  language_id: string | null;
  microTask: {
    id: string;
    code: string;
    is_test: boolean;
    file_path: string | null;
    text: string | null;
    type: string | null;
    minimum_seconds: number | null;
    maximum_seconds: number | null;
    has_meet_target_dataset: boolean | null;
    created_by: string | null;
    updated_by: string | null;
    created_date: string;
    updated_date: string;
    task_id: string;
    status: string;
  };
  contributor: {
    id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    phone_number: string | null;
    profile_picture: string | null;
    birth_date: string;
    gender: string;
    is_active: boolean;
    created_by: string | null;
    updated_by: string | null;
    created_date: string;
    updated_date: string;
    language_id: string;
    dialect_id: string;
    role_id: string;
    woreda: string | null;
    city: string | null;
    zone_id: string | null;
    region_id: string | null;
    sectors: string | null;
    score: number | null;
  };
}
interface Language {
  id: string;
  name: string;
  code: string;
  created_by: string | null;
  updated_by: string | null;
  created_date: string;
  updated_date: string;
}

export interface Dialect {
  id: string;
  name: string;
  description: string;
  created_by: string;
  updated_by: string;
  created_date: string;
  updated_date: string;
  language_id: string;
}
export interface TaskCardType {
  id: string;
  description: string,
  name: string,
  status: "active" | "inactive" | "Active" | "Inactive";
  date: string;
  updated_by: null,
  created_date: string,
  is_closed: boolean;
  updated_date: string
  created_by: string,
  dialect: string,
  project_id: string,
  language_id: string;
  is_public: boolean;
  require_contributor_test: boolean;
  distribution_started: boolean;
  taskType: {
    id: string;
    task_type: string;
    created_by: string;
    updated_by: string | null;
    created_date: string;
    updated_date: string;
  }
}
export interface TaskDetailStatus {
  id: string;
  description: string,
  name: string,
  status: "active" | "inactive" | "Active" | "Inactive";
  date: string;
  updated_by: null,
  created_date: string,
  updated_date: string
  created_by: string,
  dialect: string,
  is_closed: boolean,
  project_id: string,
}
export interface Task {
  id: string;
  description: string,
  name: string,
  is_closed: boolean;
  status: "active" | "inactive" | "Active" | "Inactive";
  date: string;
  updated_by: null,
  created_date: string,
  updated_date: string
  created_by: string,
  dialect: string,
  project_id: string,
  taskType?: {
    id: string;
    task_type: string;
    created_by: string;
    updated_by: string | null;
    created_date: string;
    updated_date: string;
  }
}
export interface UpdateTask {
  id?: string;
  max_contributor_per_micro_task: number;
  contributor_payment_per_microtask: number;
  reviewer_payment_per_microtask: number;
  max_micro_task_per_contributor: number | null;
  require_contributor_test: boolean;
  max_contributor_per_facilitator: number | null;
  max_retry_per_task: number;
  expected_number_of_total_contributors: number;
  is_dialect_specific: boolean;
  dialects?: string[];
  is_age_specific: boolean;
  age?: { min: number; max: number };
  is_sector_specific: boolean;
  sectors?: string[];
  is_gender_specific: boolean;
  gender?: { male: number; female: number };
  is_location_specific: boolean;
  locations?: { name: string }[];
}
export interface NewTask {
  id?: string;
  name: string;
  description: string;
  project_id: string;
  task_type_id: string;
  language_id: string;
  is_public: boolean;
  max_contributor_per_micro_task: number | null;
  max_retry_per_task: number | null;
  is_dialect_specific: boolean;
  dialects?: string[];
  is_age_specific: boolean;
  age?: { min: number; max: number };
  is_sector_specific: boolean;
  sectors?: string[];
  is_gender_specific: boolean;
  gender?: { male: number; female: number };
  is_location_specific: boolean;
  locations?: { name: string }[];
}
export interface RejectType {

  id: string,
  name: string,
  description: string,
  created_by: string,
  updated_by: string,
  created_date: string,
  updated_date: string,
  deletedAt: string

}
export interface ContributorStats {
  total_contributor_micro_tasks: {
    [status: string]: number; // e.g., "New": 7
  };
  total_micro_tasks: {
    NOT_ASSIGNED: number;
    PARTILALLY_ASSIGNED: number;
    ASSIGNED: number;
  };
  language_statistics: LanguageStatistic[];
  gender_statistics: GenderStatistic[];
}

export interface LanguageStatistic {
  dialect_id: string;
  dialect_name: string;
  dialect_description: string;
  count: string;
}

export interface GenderStatistic {
  gender: 'Male' | 'Female' | string;
  count: string; // 
}
export interface ReviewerDatset {
  id: string;
  code: string;
  text_data_set: string;
  status: string;
  is_draft: boolean;
  is_flagged: boolean;
  is_paid_for_contributor: boolean;
  rejection_reason_id: string | null;
  is_paid_for_reviewer: boolean;
  is_test: boolean;
  audio_duration: number | null;
  created_by: string | null;
  updated_by: string | null;
  file_path: string | null;
  type: string;
  created_date: string;
  updated_date: string;
  micro_task_id: string;
  contributor_id: string;
  reviewer_id: string | null;
  annotation: string;
  dialect_id: string;
  language_id: string | null;
  microTask: {
    id: string;
    code: string;
    is_test: boolean;
    file_path: string | null;
    text: string | null;
    type: string | null;
    minimum_seconds: number | null;
    maximum_seconds: number | null;
    has_meet_target_dataset: boolean | null;
    created_by: string | null;
    updated_by: string | null;
    created_date: string;
    updated_date: string;
    task_id: string;
    status: string;
  };
  contributor: {
    id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    phone_number: string | null;
    profile_picture: string | null;
    birth_date: string;
    gender: string;
    is_active: boolean;
    created_by: string | null;
    updated_by: string | null;
    created_date: string;
    updated_date: string;
    language_id: string;
    dialect_id: string;
    role_id: string;
    woreda: string | null;
    city: string | null;
    zone_id: string | null;
    region_id: string | null;
    sectors: string | null;
    score?: number | null;
  };
  rejectionReasons: RejectionReason[];
  flagReason: FlagReason[];

}
export interface RejectionReason {
  id: string;
  reason: string;
  comment: string;
  created_date: string;
  updated_date: string;
  data_set_id: string;
  rejection_type_id: string;
  rejectionType: {
    name: string
  }
}
export interface FlagReason {
  id: string;
  reason: string;
  comment: string;
  created_date: string;
  updated_date: string;
  data_set_id: string;
  flag_type_id: string;
  flagType: {
    name: string
  }
}
export interface ReviewerDatsets {
  contributor_id: string;
  contributor: {
    id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    phone_number: string | null;
    profile_picture: string | null;
    birth_date: string;
    gender: string;
    is_active: boolean;
    created_by: string | null;
    updated_by: string | null;
    created_date: string;
    updated_date: string;
    language_id: string;
    dialect_id: string;
    role_id: string;
    woreda: string | null;
    city: string | null;
    zone_id: string | null;
    region_id: string | null;
    sectors: string | null;
    score: number | null;
  };
  data_sets: data_sets[];
}
export interface MicroTask {
  id: string;
  code: string;
  is_test: boolean;
  file_path: string | null;
  text: string;
  type: string;
  minimum_seconds: number | null;
  maximum_seconds: number | null;
  created_by: string;
  updated_by: string | null;
  created_date: string;
  updated_date: string;
  task_id: string;
  instruction: string;
}
interface Data {
  id: string;
  name: string;
  number_of_retry_per_question: number;
  number_of_contributer_per_question: number;
  description: string | null;
  is_public: boolean;
  distribution_started: boolean;
  is_closed: boolean;
  is_dialect_specific: boolean;
  created_by: string;
  updated_by: string | null;
  created_date: string;
  updated_date: string;
  project_id: string;
  task_type_id: string;
  language_id: string;
  language: Language;
  dialects: Dialect[];
}
export interface payment {
  "id": string,
  "task_id": string,
  "contributor_credit_per_microtask": number,
  "reviewer_credit_per_microtask": number,
  "status": string | null,
  "created_by": string,
  "updated_by": string | null,
  "created_date": string,
  "updated_date": string
}
export interface TaskResponseData {

  id: string;
  name: string;
  distribution_started: boolean;
  contributor_completion_time_limit: number | null;
  reviewer_completion_time_limit: number | null;
  is_closed: boolean;
  number_of_retry_per_question: number;
  number_of_contributer_per_question: number;
  require_contributor_test: boolean;
  description: string | null;
  is_public: boolean;
  is_dialect_specific: boolean;
  created_by: string;
  updated_by: string | null;
  created_date: string;
  updated_date: string;
  project_id: string;
  task_type_id: string;
  max_expected_no_of_contributors: number | null;
  language_id: string;
  language: Language;
  dialects: Dialect[];
  taskRequirement: {
    id: string;
    task_id: string;
    max_contributor_per_micro_task: number;
    max_dataset_per_reviewer: number;
  max_expected_no_of_contributors: number| null;
    max_micro_task_per_contributor: number | null;
    max_contributor_per_facilitator: number | null;
    batch: number | null;
    minimum_seconds: number | null,
    maximum_seconds: number | null,
    minimum_characters_length: number | null;
    maximum_characters_length: number | null;
    contributor_completion_time_limit: number | null;
    reviewer_completion_time_limit: number | null;
    appriximate_time_per_batch: number | null;
    max_retry_per_task: number;
    expected_number_of_total_contributors: number;
    is_dialect_specific: boolean;
    dialects: { id: string; name: string }[];
    is_age_specific: boolean;
    age: { min: number; max: number };
    is_sector_specific: boolean;
    sectors: { name: string }[];
    is_gender_specific: boolean;
    gender: { male: number; female: number };
    is_location_specific: boolean;
    locations: { name: string }[];
    created_date: string;
    updated_date: string;
    reviewer_payment_per_microtask: number;
    contributor_payment_per_microtask: number;
  };
  taskType: {
    id: string;
    task_type: string;
    created_by: string;
    updated_by: string | null;
    created_date: string;
    updated_date: string;
  }
  taskInstructions: TaskInstructions[];
  payment: payment | null;

}
export interface TaskResponse {
  message: string;
  code: number;
  data: TaskResponseData
}

export interface TaskResponseData {
  message: string;
  code: number;
  data: Data;

}
export interface NewProject {
  name: string,
  description: string,
  start_date: string,
  end_date: string,
  manager_email: string,
  status: string,
  image: File | null,
  tags?: string[] | null,
}
export interface Project {
  name: string,
  description: string,
  start_date: string,
  end_date: string,
  manager_id: string,
  manager_email: string,
  status: string,
  image: File | null,
}
export interface ProjectOnly {
  name: string,
  description: string,
  start_date: string,
  end_date: string,
  manager_id: string,
  status: string,
  image: File | null,
}
export interface UpdateProject {
  id: string,
  name: string,
  description: string,
  start_date: string,
  end_date: string,
  // manager_id: string,
  // manager_email: string,
  status: string,
  image: File | null,
  tags?: string[] | null,
}
export interface Invitation {
  projectId: string,
  expiry_date: string,
  role: "" | "Contributor" | "Facilitator" | "Reviewer",
  organization_id: string,
  max_invitations: number,
}
export interface AssignTask {
  taskId: string,
  memberType: string,
  emails: string[],
}export interface AssignfacilitatorContributor {
  taskId: string,
  facilitator_id: string,
  contributor_ids: string[],

}
export interface AssignTaskContributor {
  taskId: string,
  contributor_ids: string[],
  memeberType: string
}
export interface AssignAutomaticContributor {
  taskId: string,
}
export interface InvitationTask {
  taskId: string,
  expiry_date: string,
  role: "" | "Contributor" | "Facilitator" | "Reviewer",
  organization_id: string,
  max_invitations: number,
}
export interface Instruction {
  taskId: string,
  title: string,
  content: string,
  video_instruction_url: string,
  audio_instruction_url: string
}
export interface InvitationResponse {
  created_by: string,
  created_date: string,
  expiry_date: string,
  id: string,
  max_invitations: number
  organization_id: string,
  project_id: string,
  role: "" | "Contributor" | "Facilitator" | "Reviewer"
  task_id: string,
}
export interface ProjectDetail {
  id: string;
  name: string;
  status: "active" | "inactive" | "Active" | "Inactive";
  start_date: string;
  end_date: string;
  description: string;
  manager_id: string;
  image: File | null;
  created_by: string;
  updated_by: string | null;
  created_date: string;
  updated_date: string;
  cover_image_url: string | undefined;
}

export interface UpdateTaskForm {
  id: string;
  name: string;
  description: string;
  task_type_id: string;
  language_id: string;
  is_public: boolean;
  require_contributor_test: boolean;
}

export interface MicroTaskList {
  id: string;
  code: string;
  is_test: boolean;
  file_path: string;
  text: string | null;
  type: 'audio' | 'text' | string;
  has_meet_target_dataset: boolean | null;
  created_by: string;
  updated_by: string | null;
  created_date: string;
  updated_date: string
  task_id: string;
  status: string;
}

export interface MicroTaskStatistic {
  id: string;
  micro_task_id: string;
  task_id: string;
  no_of_contributors: number;
  expected_no_of_contributors: number;
  total_male: number;
  total_female: number;
  created_date: string;
  microTask: MicroTaskList;
}
export interface MicroTaskStatisticReviewer {
  id: string;
  reviewer_id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  reviewed_count: number;
  pending_count: number;
}
export interface Contributor {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  national_id: string | null;
  profile_picture: string | null;
  birth_date: string;
  gender: string | null;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_date: string;
  updated_date: string;
  language_id: string;
  dialect_id: string;
  role_id: string;
  woreda: string;
  city: string;
  zone_id: string;
  region_id: string;
  sectors: string | null;
}

export interface ContributorMicroTaskAssignment {
  id: string;
  contributor_id: string;
  gender: string | null;
  task_id: string;
  micro_task_ids: string[];
  status: string;
  expected_micro_task_for_contributor: number;
  batch: number;
  current_batch: number;
  total_micro_tasks: number;
  dead_line: string;
  created_date: string;
  contributor: Contributor;
}
