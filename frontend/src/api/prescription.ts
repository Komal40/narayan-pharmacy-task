import { makeRequest } from './client';
import type { AxiosResponse } from 'axios';
import type {
  PrescriptionCreatePayload,
  PrescriptionDetail,
  PrescriptionListItem,
} from '../types';

const prescriptionsEndPoint= '/api/prescriptions/';

export const createPrescription = (
  payload: PrescriptionCreatePayload
): Promise<AxiosResponse<PrescriptionDetail>> =>
  makeRequest<PrescriptionDetail>({
    method: 'POST',
    url: prescriptionsEndPoint,
    data: payload,
  });


export const getAllPrescriptions = (): Promise<AxiosResponse<PrescriptionListItem[]>> =>
  makeRequest<PrescriptionListItem[]>({
    method: 'GET',
    url: prescriptionsEndPoint,
  });


export const getPrescriptionById = (
  id: number
): Promise<AxiosResponse<PrescriptionDetail>> =>
  makeRequest<PrescriptionDetail>({
    method: 'GET',
    url: `${prescriptionsEndPoint}${id}`,
  });