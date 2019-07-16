select
    ID
from
    dbo.Employee
where
    CompanyID = @companyId and
    ID = @id