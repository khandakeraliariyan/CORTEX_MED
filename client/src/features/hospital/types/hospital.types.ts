export interface HospitalSettings {
  _id: string;
  hospitalName: string;
  facilityId: string;
}

export interface UpdateHospitalSettingsPayload {
  hospitalName?: string;
  facilityId?: string;
}
