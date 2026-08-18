export interface ConsultationData {
  customerId: string;
  fullName: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  venue: string;
  budget: string;
  specialRequest: string;
}


export async function createConsultation(
  consultation: ConsultationData
) {
  const response = await fetch("/api/consultations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(consultation),
  });


  const result = await response.json();


  if (!response.ok) {
    throw new Error(
      result?.error || "Unable to submit consultation."
    );
  }


  return result;
}