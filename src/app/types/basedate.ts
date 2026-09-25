export interface Language {
  id: string;
  name: string,
  code: string,
  created_date: string;
  description: string,
}

export interface NewLanguage {

  name: string,
  code: string,

}
export interface DialectBasedata {
  id: string;
  name: string,
  code: string,
  description: string,
  language: {
    id: string,
    name: string,
  }
}
export interface AnnotationBasedata {
  id: string;
  name: string,
  code: string,
  description: string,
  annotationType?: {
    id: string,
    name: string,
  }
  annotation_type: {
    id: string,
    name: string,
  }
}
export interface RegionBasedata {
  id: string;
  name: string,
  code: string,
  description: string,
  country: {
    id: string,
    name: string,
  }
}
export interface BasedataTaskType {
  id: string;
  task_type: string,
  code: string,
  description: string,

}
export interface Basedata {
  id: string;
  name: string,
  code: string,
  description: string,

}
export interface Dialect {
  id: string;
  name: string,
  description: string,
  code: string

}
export interface Sector {
  id: string;
  name: string,
  description: string,
  code: string

}
export interface RejectionType {
  id: string;
  name: string,
  description: string,
  code: string

}

export interface Organization {
  id: string;
  name: string,
  email: string,
  phone: string,
  address: string
}
