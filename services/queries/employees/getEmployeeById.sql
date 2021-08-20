select
    ee.ID,
    ee.CompanyID,
    ee.EmployeeCode,
    ee.FirstName,
    ee.LastName,
	pt.IsSalary,
    ee.PR_Integration_PK as evoEmployeeId,
    c.PR_Integration_PK as evoCompanyId,
    c.PRIntegration_ClientID as evoClientId
from
    dbo.Employee ee
left join 
    dbo.EmployeeCompensation ec on ec.EmployeeID = ee.ID
left join
    dbo.PayType pt on pt.ID = ec.PayTypeID
inner join
    dbo.Company c on ee.CompanyID = c.ID
where
    ee.ID = @employeeId