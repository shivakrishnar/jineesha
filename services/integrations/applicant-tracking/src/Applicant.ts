export class Applicant {
    candidate: Candidate;
}

export class Candidate {
    person: Person;
    profiles: Profile[];
}

export class Person {
    id: ID;
    name: Name;
    gender: string;
    citizenship: string[];
    applyDate: string;
    communication: Communication;
}

export class Communication {
    address: Address[];
    phone: Phone[];
    email: Email[];
    web: any[];
}

export class Address {
    city: string= '';
    countrySubdivisions: CountrySubdivision[];
    formattedAddress: string;
    line: string;
    postalCode: string;
}

export class CountrySubdivision {
    type: string;
    value: string;
}

export class Email {
    address: string;
}

export class Phone {
    formattedNumber: string;
}

export class ID {
    value: string;
    schemeId: string;
    schemeAgencyId: string;
}

export class Name {
    given: string;
    family: string;
    formattedName: string;
}

export class Profile {
    languageCode: string;
    profileId: ID;
    associatedPositionOpenings: AssociatedPositionOpening[];
    education: Education[];
    attachments: Attachment[];
}

export class AssociatedPositionOpening {
    positionOpeningId: ID;
    positionTitle: string;
    positionUri: string;
    candidateStatus: CandidateStatus;
}

export class CandidateStatus {
    name: string;
    category: string;
    transitionDateTime: string;
}

export class Attachment {
    id: ID;
    descriptions: string[];
    url: string;
}

export class Education {
    educationLevelCodes: EducationLevelCode[];
}

export class EducationLevelCode {
    name: string;
}
