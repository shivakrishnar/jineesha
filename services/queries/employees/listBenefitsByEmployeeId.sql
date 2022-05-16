declare @_employeeId as int = @employeeId
declare @_companyId as int = @companyId 

-- Get total count for pagination
select count(*) as totalCount from BenefitPlan as bp
Where bp.CompanyID = @_companyId
AND GETDATE() between bp.StartDate and bp.EndDate

SELECT 
	bp.ID,
	bp.CompanyID,
	bp.Code,
	bp.Description,
	bp.PolicyNumber,
	bp.StartDate,
	bp.EndDate,
    eb.ID AS EmployeeBenefitID,
	eb.CoverageTypeID,
	bct.Description AS CoverageTypeDescription,
	bpt.ID AS PlanTypeID,
	bpt.Code AS PlanTypeCode,
	bpt.Description AS PlanTypeDescription,
	bc.Name AS CarrierName,
	bc.WebsiteURL AS CarrierUrl,
	eb.Premium,
	eb.DeductionFrequencyCode AS DeductionFrequency,
	bp.AnnualHSALimitSingle,
	bp.AnnualHSALimitFamily,
	bp.AnnualHSAEmployerContributionSingle,
	bp.AnnualHSAEmployerContributionFamily,
	eb.EmployeeAmount AS EmployeeContribution,
	bp.AnnualFSALimit,
	bp.AnnualDCALimit,
	eb.CoverageAmount,
    bp.DisabilityPercentOfMonthlyOrWeeklyEarnings AS DisabilityPercent,
	bp.LifeGuaranteedIssueAmount,
	bp.LifeBenefitMinimum AS BenefitMinimum,
    bp.LifeBenefitMaximum AS BenefitMaximum,
CASE WHEN eb.employeeID IS Null THEN 0 -- if there was not employee benefit row for this plan for this employee - they waived
WHEN GETDATE() between eb.StartDate and eb.EndDate THEN 1 -- if there was an eb row for this plan for this employee and today is between the EMPLOYEE start/end time for benefit - active
ELSE 0 -- if today's date is outside their start/end date then this plan is not applicable
END AS Elected
FROM BenefitPlan bp -- get all Company plans
LEFT JOIN EmployeeBenefit eb ON eb.PlanID = bp.ID AND (eb.EmployeeID = @_employeeId OR eb.EmployeeID = NULL) -- getting any employee benefit rows that match employeeID
LEFT JOIN BenefitCarrier AS bc ON bp.CarrierID = bc.ID
left join BenefitPlanType AS bpt ON bp.PlanTypeID = bpt.ID
LEFT JOIN BenefitPlanRate AS bpr ON bp.ID = bpr.PlanID and eb.CoverageTypeID = bpr.CoverageTypeID
LEFT JOIN BenefitCoverageType AS bct ON bpr.CoverageTypeID = bct.ID
WHERE bp.CompanyID = @_companyId
AND GETDATE() between bp.StartDate and bp.EndDate
ORDER BY bp.StartDate