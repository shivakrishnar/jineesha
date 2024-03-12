select ee.BirthDate, 
	   ee.ClockNumber, 
	   ee.EmailAddress as Email, 
	   ee.PhoneHome, 
	   ee.PhoneWork, 
	   ee.PhoneCell, 
	   gt.Code as Gender, 
	   et.Code as Ethnicity, 
	   elt.Code as Education, 
	   ee.IsSmoker as TobaccoUser, 
	   ee.IsDisabled, 
	   ee.VetStatus_MilitaryReserve as MilitaryReserve, 
	   ee.VetStatus_Veteran as Veteran,
	   ee.UD_Memo1 as Memo1, 
	   ee.UD_Memo2 as Memo2, 
	   ee.UD_Memo3 as Memo3, 
	   ft.Code as PayFrequency, 
	   ee.StandardPayrollHours_EVO as StandardPayrollHours, 
	   ee.FLSAClassification_EVO as FLSAClassification,
	   posType.Code as Position, 
	   rpt1.EmployeeCode as ReportsTo1, 
	   rpt2.EmployeeCode as ReportsTo2,
	   rpt3.EmployeeCode as ReportsTo3,
	   epo.AlternateSupervisor as SupervisorSC,
	   bc.Code as BenefitClass, 
	   cat.Code as EEOCategory,
	   wct.Code + '(' + cst.CountryCode + ')' as WorkerCompCode,
	   pocr.Code as ChangeReason,
	   epo.Comment

from Employee ee
		left join GenderType gt on ee.GenderTypeId = gt.ID
		left join EthnicityType et on ee.EthnicityTypeID = et.ID
		left join EducationLevelType elt on ee.EducationLevelTypeID = elt.ID
		left join FrequencyType ft on ee.FrequencyTypeID_EVO = ft.ID
		left join PositionType posType on ee.CurrentPositionTypeID = posType.ID
		left join Employee rpt1 on rpt1.ID = ee.CurrentSupervisor1ID and rpt1.CompanyID = ee.CompanyID
		left join Employee rpt2 on rpt2.ID = ee.CurrentSupervisor2ID and rpt2.CompanyID = ee.CompanyID
		left join Employee rpt3 on rpt3.ID = ee.CurrentSupervisor3ID and rpt3.CompanyID = ee.CompanyID
		left join EmployeePositionOrganization epo on 
			epo.employeeid = ee.id and 
			epo.EffectiveDate = (select max(EffectiveDate) from EmployeePositionOrganization where EmployeeID = ee.id)
		left join BenefitClass bc on bc.id = epo.BenefitClassID
		left join EEOType cat on cat.id = ee.CurrentEEOTypeID
		left join WorkerCompType wct on wct.id = ee.CurrentWorkerCompTypeID
		left join CountryStateType cst on wct.CountryStateTypeID = cst.ID
		left join PositionOrganizationChangeReason pocr on pocr.id = ee.CurrentPositionOrganizationChangeReasonID

where ee.EmployeeCode = @EmployeeCode and 
      ee.CompanyID = @CompanyID;