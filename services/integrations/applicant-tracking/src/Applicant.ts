/**
 * @class: Applicant
 * @description: A class representing Applicant Request
 */
export class Applicant {
    candidate: Candidate;
}

/**
 * @class: Candidate
 * @description: A class representing Candidate
 */

export class Candidate {
    person: Person;
    profiles: Profile[];
}

/**
 * @class: Person
 * @description: A class representing Personal Information
 */
export class Person {
    id: ID;
    name: Name;
    gender: string;
    citizenship: string[];
    applyDate: string;
    communication: Communication;
}

/**
 * @class: Communication
 * @description: A class representing Communication Details
 */
export class Communication {
    address: Address[];
    phone: Phone[];
    email: Email[];
    web: any[];
}

/**
 * @class: Address
 * @description: A class representing Address
 */
export class Address {
    city = '';
    countrySubdivisions: CountrySubdivision[];
    formattedAddress: string;
    line: string;
    postalCode: string;
}

/**
 * @class: CountrySubdivision
 * @description: A class representing State
 */
export class CountrySubdivision {
    type: string;
    value: string;
}

/**
 * @class: Email
 * @description: A class representing Email address
 */
export class Email {
    address: string;
}

/**
 * @class: Phone
 * @description: A class representing Phone
 */
export class Phone {
    formattedNumber: string;
}

/**
 * @class: ID
 * @description: A class representing ID
 */
export class ID {
    value: string;
    schemeId: string;
    schemeAgencyId: string;
}

/**
 * @class: Name
 * @description: A class representing Name
 */
export class Name {
    given: string;
    family: string;
    formattedName: string;
}

/**
 * @class: Profile
 * @description: A class representing Profile
 */
export class Profile {
    languageCode: string;
    profileId: ID;
    associatedPositionOpenings: AssociatedPositionOpening[];
    education: Education[];
    attachments: Attachment[];
}

/**
 * @class: AssociatedPositionOpening
 * @description: A class representing AssociatedPositionOpening
 */
export class AssociatedPositionOpening {
    positionOpeningId: ID;
    positionTitle: string;
    positionUri: string;
    candidateStatus: CandidateStatus;
}

/**
 * @class: CandidateStatus
 * @description: A class representing CandidateStatus
 */
export class CandidateStatus {
    name: string;
    category: string;
    transitionDateTime: string;
}

/**
 * @class: Attachment
 * @description: A class representing Attachment
 */
export class Attachment {
    id: ID;
    descriptions: string[];
    url: string;
}

/**
 * @class: Education
 * @description: A class representing Education
 */
export class Education {
    educationLevelCodes: EducationLevelCode[];
}

/**
 * @class: EducationLevelCode
 * @description: A class representing EducationLevelCode
 */
export class EducationLevelCode {
    name: string;
}
