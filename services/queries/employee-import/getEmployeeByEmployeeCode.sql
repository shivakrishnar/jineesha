select
	Emp.ID,
	Emp.CompanyID,
	Emp.EmployeeCode,
	Emp.FirstName,
	Emp.LastName,
	Emp.PR_Integration_PK as EvoEmployeeId,
	Comp.PR_Integration_PK as EvoCompanyId,
	Comp.PRIntegration_ClientID as EvoClientId
from
	dbo.Employee Emp inner join
	dbo.Company Comp on Emp.CompanyID = Comp.ID
where
	Emp.CompanyID = @CompanyID
and Emp.EmployeeCode = @EmployeeCode