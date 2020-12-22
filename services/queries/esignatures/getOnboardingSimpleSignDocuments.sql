select
    e.*,
    s.Name as SignatureStatusName,
    s.Priority as SignatureStatusPriority,
    s.StepNumber as SignatureStatusStepNumber
from
    dbo.EsignatureMetadata e
join dbo.SignatureStatus s on s.ID = e.SignatureStatusID
where
    e.Type = 'SignatureRequest' and
    e.FileMetadataID is not null and
    e.CompanyID = @companyId and
    e.EmployeeCode = '@employeeCode'