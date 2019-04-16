declare @_companyId int = @companyId;

select
    d.ID,
    d.Filename,
    d.Title,
    d.ESignDate,
    e.EmailAddress,
    e.EmployeeCode
from 
    dbo.Document d
left join
    dbo.Employee e on d.EmployeeID = e.ID
where
    e.CompanyID = @_companyId 
    or d.CompanyID = @_companyId