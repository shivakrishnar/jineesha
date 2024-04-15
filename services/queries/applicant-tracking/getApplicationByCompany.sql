declare @_companyid bigint = @CompanyID

select count(*) as totalCount
from ATApplication app
        inner join ATJobPosting job on job.id = app.ATJobPostingID and job.CompanyID = @_companyid
where CompanyID = @_companyid

select  app.ID as id,
		ATSoftStatusTypeID as atSoftStatusTypeId,
		ATApplicationKey as atApplicationKey,
		ReceivedDate as receivedDate,
		FirstName as firstName,
		MiddleName as middleName,
		LastName as lastName,
		Address1 as address1,
		Address2 as address2,
		City as city,
		Zip as zip,
		CountryStateTypeID as countryStateTypeId,
		EmailAddress as emailAddress,
		PhoneHome as phoneHome,
		PhoneCell as phoneCell,
		BirthDate as birthDate,
		SSN as ssn,
		AlternateTaxNumber as alternateTaxNumber,
		PreviousAddress as previousAddress,
		LengthAtCurrentAddress as lengthAtCurrentAddress,
		PreviousEmployer1MayWeContact as previousEmployer1MayWeContact,
		PreviousEmployer1CompanyName as previousEmployer1CompanyName,
		PreviousEmployer1Address as previousEmployer1Address,
		PreviousEmployer1City as previousEmployer1City,
		PreviousEmployer1CountryStateTypeID as previousEmployer1CountryStateTypeId,
		PreviousEmployer1Phone as previousEmployer1Phone,
		PreviousEmployer1SupervisorName as previousEmployer1SupervisorName,
		PreviousEmployer1SupervisorTitle as previousEmployer1SupervisorTitle,
		PreviousEmployer1Duties as previousEmployer1Duties,
		PreviousEmployer1LeavingReasons as previousEmployer1LeavingReasons,
		PreviousEmployer1StartingPay as previousEmployer1StartingPay,
		PreviousEmployer1EndingPay as previousEmployer1EndingPay,
		PreviousEmployer1StartDate as previousEmployer1StartDate,
		PreviousEmployer1EndDate as previousEmployer1EndDate,
		PreviousEmployer2MayWeContact as previousEmployer2MayWeContact,
		PreviousEmployer2CompanyName as previousEmployer2CompanyName,
		PreviousEmployer2Address as previousEmployer2Address,
		PreviousEmployer2City as previousEmployer2City,
		PreviousEmployer2CountryStateTypeID as previousEmployer2CountryStateTypeId,
		PreviousEmployer2Phone as previousEmployer2Phone,
		PreviousEmployer2SupervisorName as previousEmployer2SupervisorName,
		PreviousEmployer2SupervisorTitle as previousEmployer2SupervisorTitle,
		PreviousEmployer2Duties as previousEmployer2Duties,
		PreviousEmployer2LeavingReasons as previousEmployer2LeavingReasons,
		PreviousEmployer2StartingPay as previousEmployer2StartingPay,
		PreviousEmployer2EndingPay as previousEmployer2EndingPay,
		PreviousEmployer2StartDate as previousEmployer2StartDate,
		PreviousEmployer2EndDate as previousEmployer2EndDate,
		PreviousEmployer3MayWeContact as previousEmployer3MayWeContact,
		PreviousEmployer3CompanyName as previousEmployer3CompanyName,
		PreviousEmployer3Address as previousEmployer3Address,
		PreviousEmployer3City as previousEmployer3City,
		PreviousEmployer3CountryStateTypeID as previousEmployer3CountryStateTypeId,
		PreviousEmployer3Phone as previousEmployer3Phone,
		PreviousEmployer3SupervisorName as previousEmployer3SupervisorName,
		PreviousEmployer3SupervisorTitle as previousEmployer3SupervisorTitle,
		PreviousEmployer3Duties as previousEmployer3Duties,
		PreviousEmployer3LeavingReasons as previousEmployer3LeavingReasons,
		PreviousEmployer3StartingPay as previousEmployer3StartingPay,
		PreviousEmployer3EndingPay as previousEmployer3EndingPay,
		PreviousEmployer3StartDate as previousEmployer3StartDate,
		PreviousEmployer3EndDate as previousEmployer3EndDate,
		WorkHistoryConditionsThatLimitAbility as workHistoryConditionsThatLimitAbility,
		WorkHistoryConditionsHowCanWeAccommodate as workHistoryConditionsHowCanWeAccommodate,
		WorkHistoryUSLegal as workHistoryUSLegal,
		WorkHistoryConvictedOfFelony as workHistoryConvictedOfFelony,
		WorkHistoryConvictedOfFelonyReasons as workHistoryConvictedOfFelonyReasons,
		EducationHistory1EducationLevelTypeID as educationHistory1EducationLevelTypeId,
		EducationHistory1Institution as educationHistory1Institution,
		EducationHistory1Major as educationHistory1Major,
		EducationHistory1Minor as educationHistory1Minor,
		EducationHistory1CompletedDate as educationHistory1CompletedDate,
		EducationHistory2EducationLevelTypeID as educationHistory2EducationLevelTypeId,
		EducationHistory2Institution as educationHistory2Institution,
		EducationHistory2Major as educationHistory2Major,
		EducationHistory2Minor as educationHistory2Minor,
		EducationHistory2CompletedDate as educationHistory2CompletedDate,
		EducationHistory3EducationLevelTypeID as educationHistory3EducationLevelTypeId,
		EducationHistory3Institution as educationHistory3Institution,
		EducationHistory3Major as educationHistory3Major,
		EducationHistory3Minor as educationHistory3Minor,
		EducationHistory3CompletedDate as educationHistory3CompletedDate,
		ICertifyStatement as iCertifyStatement,
		KeywordList as keywordList,
		Rating as rating,
		Archived as archived,
		ATJobPostingID as atJobPostingId,
		EsignName as esignName,
		EsignStamptedDateTime as eSignStamptedDateTime,
		FormMakeOffer as formMakeOffer,
		IsWorkflowOfferAccepted as isWorkflowOfferAccepted,
		IsWorkflowOfferRejected as isWorkflowOfferRejected,
		EsignNameOffer as eSignNameOffer,
		EsignStamptedDateTimeOffer as eSignStamptedDateTimeOffer,
		ReferralSource as referralSource,
		FormRejectApplication as formRejectApplication,
		IsVetStatus_Disabled as isVetStatus_Disabled,
		IsVetStatus_RecentlySeparated as isVetStatus_RecentlySeparated,
		IsVetStatus_ActiveDutyWartime as isVetStatus_ActiveDutyWartime,
		IsVetStatus_AFServiceMedal as isVetStatus_AFServiceMedal,
		VetStatus_DischargeDate as vetStatus_DischargeDate,
		VetStatus_MilitaryReserve as vetStatus_MilitaryReserve,
		VetStatus_Veteran as vetStatus_Veteran,
		IsVetStatus_VietnamEra as isVetStatus_VietnamEra,
		IsVetStatus_Other as isVetStatus_Other,
		ExternalCandidateID as externalCandidateId,
		ExternalSystem as externalSystem,
		Gender as gender,
		ApplyDate as applyDate,
		SchemeID as schemeId,
		SchemeAgencyID as schemeAgencyId,
		PositionOpeningID as positionOpeningId,
		PositionSchemeID as positionSchemeId,
		PositionAgencyID as positionAgencyId,
		PositionUri as positionUri,
		Status as status,
		StatusCategory as statusCategory,
		StatusTransitionDateTime as statusTransitionDateTime,
		EducationLevelCode as educationLevelCode,
		Citizenship as citizenship,
		RequestJSON as requestJSON,
		DateAdded as dateAdded,
		ProfileID as profileId,
		PreviousEmployer1Title as previousEmployer1Title,
		PreviousEmployer2Title as previousEmployer2Title,
		PreviousEmployer3Title as previousEmployer3Title

from ATApplication app
        inner join ATJobPosting job on job.id = app.ATJobPostingID and job.CompanyID = @_companyid
order by app.ID