select
    *
from
    dbo.FileMetadata
where
    ID = @id and
    CompanyID = @companyId