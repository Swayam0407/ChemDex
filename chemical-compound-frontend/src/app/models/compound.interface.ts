export interface Compound {
  id: number;
  name: string;
  image: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface PaginatedCompoundsResponse {
  compounds: Compound[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface CompoundResponse {
  compound: Compound;
}

export interface UpdateCompoundRequest {
  name?: string;
  image?: string;
  description?: string;
}

export interface ApiError {
  message: string;
  status: number;
  error?: any;
}