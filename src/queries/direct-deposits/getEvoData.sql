select
    earningsAndDeductionsId = d.EvoFK_EmployeeEarningsDeduction,
    employeeId = e.PR_Integration_PK,
    companyId = c.PR_Integration_PK,
    clientId = c.PRIntegration_ClientID
from dbo.EmployeeDirectDeposit d 
left join dbo.Employee e on d.EmployeeID = e.ID
left join dbo.Company c on e.CompanyID = c.ID
where d.ID = @id