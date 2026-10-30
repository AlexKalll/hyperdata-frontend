export interface StatisticsAdmin {
    "total_micro_tasks": number,
    "total_projects": number,
    "total_tasks": number,
    "total_contributors": number,
    "total_facilitators": number,
    "total_project_managers": number,
    "total_reviewers": number,
    "total_languages": number,
    "total_dialects": number
}
export interface StatisticsProject {
    "total_micro_tasks": number,
    "total_tasks": number,
    "total_contributors": number,
    "total_facilitators": number,
    "total_reviewers": number,
    "total_data_sets": number,
    "project": {
        id: string,
        name: string
    }

}
export interface StatisticsProjectDatasetLanguage {
    "dialect_id": string,
    "dialect_name": string,
    "language_id": string,
    "language_name": string,
    "count": string

}
export interface AdminDatasetLanguage extends Array<StatisticsProjectDatasetLanguage> { }
interface StatisticsData_setsData {
    date: number;
    count: string;
}

export interface StatisticsData_sets extends Array<StatisticsData_setsData> { }
