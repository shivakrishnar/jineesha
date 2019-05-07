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
    (select ID, EmailAddress, EmployeeCode, CompanyID from dbo.Employee e where EmailAddress IN (@eeEmails)) as e on d.EmployeeID = e.ID
where
    e.CompanyID = @_companyId