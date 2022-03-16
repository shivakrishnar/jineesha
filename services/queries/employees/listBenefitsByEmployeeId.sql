declare @_employeeId as int = @employeeId
declare @_companyId as int = @companyId 

-- Get total count for pagination
select count(*) as totalCount from BenefitPlan as bp
Where bp.CompanyID = @_companyId
AND GETDATE() between bp.StartDate and bp.EndDate

SELECT bp.ID, bp.CompanyID ,bp.Code, bp.Description, bp.PolicyNumber, bp.StartDate, bp.EndDate,
bpt.ID as PlanTypeID, bpt.Code as PlanTypeCode, bpt.Description as PlanTypeDescription,
bc.Name as CarrierName, bc.WebsiteURL as CarrierURL, eb.Premium,
CASE WHEN eb.employeeID IS Null THEN 0 -- if there was not employee benefit row for this plan for this employee - they waived
WHEN GETDATE() between eb.StartDate and eb.EndDate THEN 1 -- if there was an eb row for this plan for this employee and today is between the EMPLOYEE start/end time for benefit - active
ELSE 0 -- if today's date is outside their start/end date then this plan is not applicable
END as Elected
from BenefitPlan bp -- get all Company plans
LEFT JOIN EmployeeBenefit eb ON eb.PlanID = bp.ID AND (eb.EmployeeID = @_employeeId OR eb.EmployeeID = NULL) -- getting any employee benefit rows that match employeeID
LEFT JOIN BenefitCarrier as bc on bp.CarrierID = bc.ID
left join BenefitPlanType as bpt on bp.PlanTypeID = bpt.ID
Where bp.CompanyID = @_companyId
AND GETDATE() between bp.StartDate and bp.EndDate
order by StartDate