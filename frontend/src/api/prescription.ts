import { makeRequest, type ApiResponse } from './client';
import type { AxiosResponse } from 'axios';
import type {
  PrescriptionCreatePayload,
  PrescriptionDetail,
  PrescriptionListItem,
} from '../types';

const prescriptionsEndPoint= '/api/prescriptions/';

export const createPrescription = (
  payload: PrescriptionCreatePayload
): Promise<AxiosResponse<ApiResponse<PrescriptionDetail>>> =>
  makeRequest<ApiResponse<PrescriptionDetail>>({
    method: 'POST',
    url: prescriptionsEndPoint,
    data: payload,
  });


export const getAllPrescriptions = (): Promise<AxiosResponse<ApiResponse<PrescriptionListItem[]>>> =>
  makeRequest<ApiResponse<PrescriptionListItem[]>>({
    method: 'GET',
    url: prescriptionsEndPoint,
  });


export const getPrescriptionById = (
  id: number
): Promise<AxiosResponse<ApiResponse<PrescriptionDetail>>> =>
  makeRequest<ApiResponse<PrescriptionDetail>>({
    method: 'GET',
    url: `${prescriptionsEndPoint}${id}`,
  });