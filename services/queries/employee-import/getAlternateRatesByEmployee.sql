select alt.ID, 
	   alt.PR_Integration_PK as altRateId,
       alt.RateNumber_EVO,
	   alt.HourlyRate,
	   alt.StartDate,

	   org1.PR_Integration_PK as org1Id,
	   org2.PR_Integration_PK as org2Id,
	   org3.PR_Integration_PK as org3Id,
	   org4.PR_Integration_PK as org4Id,
	   
	   wComp.PR_Integration_PK as workerCompensationId,
	   wComp.Description workerCompDesc,
	   countryStateType.PR_Integration_PK stateId,

	   posType.PR_Integration_PK as positionId,
	   gradeType.PayRangeTypeID as payGradeId

from EmployeeAlternateRate alt
	left join OrganizationType org1 on org1.id = alt.Org1ID
	left join OrganizationType org2 on org2.id = alt.Org2ID
	left join OrganizationType org3 on org3.id = alt.Org3ID
	left join OrganizationType org4 on org4.id = alt.Org4ID
	left join WorkerCompType wComp on wComp.id = alt.WorkerCompTypeID
	left join CountryStateType countryStateType on countryStateType.id = wComp.CountryStateTypeID

	left join PositionType posType on posType.id = alt.PositionTypeID
	left join PayGradeType gradeType on gradeType.id = alt.PayGradeTypeID

where alt.EmployeeID = @EmployeeID and
      alt.RateNumber_EVO = @RateNumber_EVO