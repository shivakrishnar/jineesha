select
    ID,
    ESignDate,
    IsPublishedToEmployee,
    UploadByUsername,
    DocumentCategory,
    Title,
    Pointer
from
    dbo.Document
where
    ID = @id and
    EmployeeID = @employeeId