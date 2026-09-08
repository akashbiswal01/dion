export type RootStackParamList = {
  Splash: undefined;

  Login: undefined;
  Signup: undefined;

  Dashboard: undefined;
  Profile: undefined;

  Project: undefined;

  Tower: undefined;
  Floor: {
    towerName: string;
    block_id: number;
  };
  FlatList: {
    towerName: string;
    floor: number;
    block_id: number;
    floor_id?: number;
  };

  FlatDetails: {
    flat: FlatData;
  };

  ApplicantDetails: {
    flat: FlatData;
  };

  SecondApplicant: {
    flat: FlatData;
    applicant: ApplicantData;
  };

  PaymentPlan: {
    flat: FlatData;
    applicant: ApplicantData;
    secondApplicant?: ApplicantData;
    applicationId?: number;
    applicationNumber?: string;
  };

  BookingSummary:
    | {
        flat?: FlatData;
        applicant?: ApplicantData;
        secondApplicant?: ApplicantData;
        paymentPlan?: string;
        applicationId?: number;
        applicationNumber?: string;
      }
    | undefined;

  BookingAmount: {
    flat: FlatData;
    applicant: ApplicantData;
    secondApplicant?: ApplicantData;
    paymentPlan?: string;
    applicationId?: number;
    applicationNumber?: string;
  };

  ApplicationSubmitted: {
    applicationNumber: string;
    flatNumber: string;
    applicationId?: number;
    pdfUrl?: string;
    bookingAmount?: number;
  };

  MyBooking: undefined;

  Payments: undefined;

  PaymentDetails: {
    paymentId: string;
  };

  Documents: undefined;

  ApiConfig: undefined;
};

export interface FlatData {
  id: string;
  flatNumber: string;
  tower: string;
  block?: string;
  floor: number;
  type: string;
  carpetArea: number;
  builtUpArea: number;
  superBuiltUpArea: number;
  ratePerSqft: number;
  totalCost: number;
  status: "AVAILABLE" | "HOLD" | "BOOKED" | "SOLD";
}

export interface ApplicantData {
  firstName: string;
  middleName?: string;
  lastName: string;
  fatherGuardianName: string;
  dob: string;
  age?: number | string;
  mobile: string;
  officeNo?: string;
  resNo?: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  nationality: string;
  residentialStatus: string;
  panNumber: string;
  ward?: string;

  // Optional payment details
  paymentPlan?: string;
  sourceOfPayment?: string;
  totalCost?: string | number;
  remittanceSum?: string | number;
  paymentMode?: string;
  referenceNo?: string;
  paymentDate?: string;
  drawnOn?: string;
}