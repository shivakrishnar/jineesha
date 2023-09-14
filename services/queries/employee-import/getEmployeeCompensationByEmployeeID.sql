select empComp.PR_Integration_PK as empCompId,
       empComp.EffectiveDate,
       empComp.Rate,

	   org1.PR_Integration_PK as org1Id,
	   org2.PR_Integration_PK as org2Id,
	   org3.PR_Integration_PK as org3Id,
	   org4.PR_Integration_PK as org4Id,
	   
	   wComp.PR_Integration_PK as workerCompensationId,
	   wComp.Description workerCompDesc,
	   countryStateType.PR_Integration_PK stateId,

	   posType.PR_Integration_PK as positionId,
	   gradeType.PayRangeTypeID as payGradeId,
	   empcomp.JobTypeID_Evo as jobId,

	   pay.code as payTypeCode

from EmployeeCompensation empComp 
		inner join PayType pay on pay.id = empComp.paytypeid
		left join OrganizationType org1 on org1.id = empComp.Org1TypeID
		left join OrganizationType org2 on org2.id = empComp.Org2TypeID
		left join OrganizationType org3 on org3.id = empComp.Org3TypeID
		left join OrganizationType org4 on org4.id = empComp.Org4TypeID
		left join WorkerCompType wComp on wComp.id = empComp.WorkerCompTypeID
		left join CountryStateType countryStateType on countryStateType.id = wComp.CountryStateTypeID
		left join PositionType posType on posType.id = empComp.PositionTypeID
		left join PayGradeType gradeType on gradeType.id = empComp.PayGradeTypeID
where empComp.EmployeeID = @EmployeeID
order by EffectiveDate desc