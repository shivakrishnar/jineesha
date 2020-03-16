select
    ID,
    Pointer
from
    dbo.Document
where
    ID = @id and
    CompanyID = @companyId