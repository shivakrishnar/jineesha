select
    e.*,
    f.Pointer,
    e.ID as SignedEsignatureMetadataId,
    s.Name as SignatureStatusName,
    s.Priority as SignatureStatusPriority,
    s.StepNumber as SignatureStatusStepNumber
from
    dbo.EsignatureMetadata e
join dbo.SignatureStatus s on s.ID = e.SignatureStatusID
join dbo.FileMetadata f on f.ID = e.FileMetadataID
where
    e.Type = 'SignatureRequest' and
    e.FileMetadataID is not null and
    e.CompanyID = @companyId and
    e.EmployeeCode = '@employeeCode'