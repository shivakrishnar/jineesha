update ATApplication
set
	ATSoftStatusTypeID = @ATSoftStatusTypeID,
    ReceivedDate = @ReceivedDate,
    FirstName = @FirstName,
    MiddleName = @MiddleName,
    LastName = @LastName,
    Address1 = @Address1,
    Address2 = @Address2,
    City = @City,
    Zip = @Zip,
    CountryStateTypeID = @CountryStateTypeID,
    EmailAddress = @EmailAddress,
    PhoneHome = @PhoneHome,
    PhoneCell = @PhoneCell,
    BirthDate = @BirthDate,
    SSN = @SSN,
    AlternateTaxNumber = @AlternateTaxNumber,
    PreviousAddress = @PreviousAddress,
    LengthAtCurrentAddress = @LengthAtCurrentAddress,

    PreviousEmployer1MayWeContact = @PreviousEmployer1MayWeContact,
    PreviousEmployer1CompanyName = @PreviousEmployer1CompanyName,
    PreviousEmployer1Address = @PreviousEmployer1Address,
    PreviousEmployer1City = @PreviousEmployer1City,
    PreviousEmployer1CountryStateTypeID = @PreviousEmployer1CountryStateTypeID,
    PreviousEmployer1Phone = @PreviousEmployer1Phone,
    PreviousEmployer1SupervisorName = @PreviousEmployer1SupervisorName,
    PreviousEmployer1SupervisorTitle = @PreviousEmployer1SupervisorTitle,
    PreviousEmployer1Duties = @PreviousEmployer1Duties,
    PreviousEmployer1LeavingReasons = @PreviousEmployer1LeavingReasons,
    PreviousEmployer1StartingPay = @PreviousEmployer1StartingPay,
    PreviousEmployer1EndingPay = @PreviousEmployer1EndingPay,
    PreviousEmployer1StartDate = @PreviousEmployer1StartDate,
    PreviousEmployer1EndDate = @PreviousEmployer1EndDate,

    PreviousEmployer2MayWeContact = @PreviousEmployer2MayWeContact,
    PreviousEmployer2CompanyName = @PreviousEmployer2CompanyName,
    PreviousEmployer2Address = @PreviousEmployer2Address,
    PreviousEmployer2City = @PreviousEmployer2City,
    PreviousEmployer2CountryStateTypeID = @PreviousEmployer2CountryStateTypeID,
    PreviousEmployer2Phone = @PreviousEmployer2Phone,
    PreviousEmployer2SupervisorName = @PreviousEmployer2SupervisorName,
    PreviousEmployer2SupervisorTitle = @PreviousEmployer2SupervisorTitle,
    PreviousEmployer2Duties = @PreviousEmployer2Duties,
    PreviousEmployer2LeavingReasons = @PreviousEmployer2LeavingReasons,
    PreviousEmployer2StartingPay = @PreviousEmployer2StartingPay,
    PreviousEmployer2EndingPay = @PreviousEmployer2EndingPay,
    PreviousEmployer2StartDate = @PreviousEmployer2StartDate,
    PreviousEmployer2EndDate = @PreviousEmployer2EndDate,

    PreviousEmployer3MayWeContact = @PreviousEmployer3MayWeContact,
    PreviousEmployer3CompanyName = @PreviousEmployer3CompanyName,
    PreviousEmployer3Address = @PreviousEmployer3Address,
    PreviousEmployer3City = @PreviousEmployer3City,
    PreviousEmployer3CountryStateTypeID = @PreviousEmployer3CountryStateTypeID,
    PreviousEmployer3Phone = @PreviousEmployer3Phone,
    PreviousEmployer3SupervisorName = @PreviousEmployer3SupervisorName,
    PreviousEmployer3SupervisorTitle = @PreviousEmployer3SupervisorTitle,
    PreviousEmployer3Duties = @PreviousEmployer3Duties,
    PreviousEmployer3LeavingReasons = @PreviousEmployer3LeavingReasons,
    PreviousEmployer3StartingPay = @PreviousEmployer3StartingPay,
    PreviousEmployer3EndingPay = @PreviousEmployer3EndingPay,
    PreviousEmployer3StartDate = @PreviousEmployer3StartDate,
    PreviousEmployer3EndDate = @PreviousEmployer3EndDate,

    WorkHistoryConditionsThatLimitAbility = @WorkHistoryConditionsThatLimitAbility,
    WorkHistoryConditionsHowCanWeAccommodate = @WorkHistoryConditionsHowCanWeAccommodate,
    WorkHistoryUSLegal = @WorkHistoryUSLegal,
    WorkHistoryConvictedOfFelony = @WorkHistoryConvictedOfFelony,
    WorkHistoryConvictedOfFelonyReasons = @WorkHistoryConvictedOfFelonyReasons,

    EducationHistory1EducationLevelTypeID = @EducationHistory1EducationLevelTypeID,
    EducationHistory1Institution = @EducationHistory1Institution,
    EducationHistory1Major = @EducationHistory1Major,
    EducationHistory1Minor = @EducationHistory1Minor,
    EducationHistory1CompletedDate = @EducationHistory1CompletedDate,

    EducationHistory2EducationLevelTypeID = @EducationHistory2EducationLevelTypeID,
    EducationHistory2Institution = @EducationHistory2Institution,
    EducationHistory2Major = @EducationHistory2Major,
    EducationHistory2Minor = @EducationHistory2Minor,
    EducationHistory2CompletedDate = @EducationHistory2CompletedDate,

    EducationHistory3EducationLevelTypeID = @EducationHistory3EducationLevelTypeID,
    EducationHistory3Institution = @EducationHistory3Institution,
    EducationHistory3Major = @EducationHistory3Major,
    EducationHistory3Minor = @EducationHistory3Minor,
    EducationHistory3CompletedDate = @EducationHistory3CompletedDate,

    ICertifyStatement = @ICertifyStatement,
    KeywordList = @KeywordList,
    Rating = @Rating,
    Archived = @Archived,
    ATJobPostingID = @ATJobPostingID,
    EsignName = @EsignName,
    EsignStamptedDateTime = @EsignStamptedDateTime,
    FormMakeOffer = @FormMakeOffer,
    IsWorkflowOfferAccepted = @IsWorkflowOfferAccepted,
    IsWorkflowOfferRejected = @IsWorkflowOfferRejected,
    EsignNameOffer = @EsignNameOffer,
    EsignStamptedDateTimeOffer = @EsignStamptedDateTimeOffer,
    ReferralSource = @ReferralSource,
    FormRejectApplication = @FormRejectApplication,
    IsVetStatus_Disabled = @IsVetStatus_Disabled,
    IsVetStatus_RecentlySeparated = @IsVetStatus_RecentlySeparated,
    IsVetStatus_ActiveDutyWartime = @IsVetStatus_ActiveDutyWartime,
    IsVetStatus_AFServiceMedal = @IsVetStatus_AFServiceMedal,

    VetStatus_DischargeDate = @VetStatus_DischargeDate,
    VetStatus_MilitaryReserve = @VetStatus_MilitaryReserve,
    VetStatus_Veteran = @VetStatus_Veteran,
    IsVetStatus_VietnamEra = @IsVetStatus_VietnamEra,
    IsVetStatus_Other = @IsVetStatus_Other,
    ExternalCandidateID = @ExternalCandidateID,
    ExternalSystem = @ExternalSystem,
    Gender = @Gender,
    ApplyDate = @ApplyDate,
    SchemeID = @SchemeID,
    SchemeAgencyID = @SchemeAgencyID,
    PositionOpeningID = @PositionOpeningID,
    PositionSchemeID = @PositionSchemeID,
    PositionAgencyID = @PositionAgencyID,
    PositionUri = @PositionUri,
    Status = @Status,
    StatusCategory = @StatusCategory,
    StatusTransitionDateTime = @StatusTransitionDateTime,
    EducationLevelCode = @EducationLevelCode,
    Citizenship = @Citizenship,
    RequestJSON = @RequestJSON,
    DateAdded = @DateAdded,
    ProfileID = @ProfileID,
    PreviousEmployer1Title = @PreviousEmployer1Title,
    PreviousEmployer2Title = @PreviousEmployer2Title,
    PreviousEmployer3Title = @PreviousEmployer3Title

where ATApplicationKey = @ATApplicationKey