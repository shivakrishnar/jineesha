select
    f.ID,
    f.CompanyID,
    f.EmployeeCode,
    f.Pointer,
    e.ID as EmployeeID
from
    dbo.FileMetadata f
left join dbo.Employee e on e.EmployeeCode = f.EmployeeCode and e.CompanyID = f.CompanyID
where
    f.CompanyID = @companyId