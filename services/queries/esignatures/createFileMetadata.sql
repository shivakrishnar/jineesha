insert
into
    dbo.FileMetadata
(
    CompanyID,
    EmployeeCode,
    Title,
    Category,
    UploadDate,
    Pointer,
    UploadedBy,
    IsPublishedToEmployee,
    EsignatureMetadataID
)
values
(
    @companyId,
    @employeeCode,
    '@title',
    @category, -- TODO: (MJ-2669) wrap in single quotes after changing Category column not nullable
    '@uploadDate',
    '@pointer',
    @uploadedBy,
    @isPublishedToEmployee,
    '@esignatureMetadataId'
)

select SCOPE_IDENTITY() as ID