export interface ConsultationData {
  customerId: string;

  fullName: string;
  email: string;
  phone: string;

  eventType: string;

  eventDate: string;
  eventTime: string;

  guestCount: string;

  venue: string;
  budget: string;

  selectedCategories: string[];

  selectedServices: string[];

  specialRequest: string;
}

export interface StepProps {
  data: ConsultationData;
  updateField: (
    field: keyof ConsultationData,
    value: string | string[]
  ) => void;
}

export const initialConsultationData: ConsultationData = {
  customerId: "",

  fullName: "",
  email: "",
  phone: "",

  eventType: "",

  eventDate: "",
  eventTime: "",

  guestCount: "",

  venue: "",
  budget: "",

  selectedCategories: [],

  selectedServices: [],

  specialRequest: "",
};