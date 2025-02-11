insert
into
    dbo.EsignatureMetadata
(
    ID,
    CompanyID,
    Type,
    UploadDate,
    UploadedBy,
    Title,
    Filename,
    Category,
    EmployeeCode,
    SignatureStatusID,
    IsOnboardingDocument,
    FileMetadataID
)
values
(
    @id,
    @companyId,
    '@type',
    getdate(),
    @uploadedBy,
    (select Title from dbo.FileMetadata where ID=@_fileMetadataID),
    @fileName,
    (select Category from dbo.FileMetadata where ID=@_fileMetadataID),
    @employeeCode,
    @signatureStatusId,
    @isOnboardingDocument,
    @_fileMetadataID
)
