declare @_documentId int = @documentId
declare @_employeeId int = (select EmployeeID from dbo.Document where ID = @_documentId)

-- Handles employee documents
if @_employeeId is not null
    begin
        select
            ID,
            FSDocument,
            Extension,
            CompanyID,
            EmployeeID,
            EmployeeName,
            EmployeeCode,
            Filename,
            ContentType,
            Title,
            IsPrivateDocument,
            UploadByUsername,
            IsPublishedToEmployee
        from openjson(
            (
                select
                    d.ID,
                    FSDocument,
                    Extension,
                    CompanyID = case
                        when d.CompanyID is NULL then c.ID
                        else d.CompanyID
                    end,
                    EmployeeID = d.EmployeeID,
                    EmployeeName = formatmessage('%s %s', e.FirstName, e.LastName),
                    EmployeeCode = formatmessage('%s', e.EmployeeCode),
                    Filename,
                    ContentType,
                    Title,
                    IsPrivateDocument = case
                        when d.IsPrivateDocument is null then 0
                        else d.IsPrivateDocument
                    end,
                    UploadByUsername,
                    IsPublishedToEmployee
                from
                    dbo.Document d
                inner join dbo.Employee e on e.ID = d.EmployeeID
                inner join dbo.Company c on c.ID = e.CompanyID
                where
                    d.ID = @_documentId for json auto
            )
        ) with (
            ID int,
            FSDocument nvarchar(max),
            Extension nvarchar(max),
            CompanyID int,
            EmployeeID int,
            EmployeeName nvarchar(max),
            EmployeeCode nvarchar(max),
            Filename nvarchar(max),
            ContentType nvarchar(max),
            Title nvarchar(max),
            IsPrivateDocument bit,
            UploadByUsername nvarchar(max),
            IsPublishedToEmployee bit
        )
    end
-- Handles company documents
else
    begin
        select
            ID,
            FSDocument,
            Extension,
            CompanyID,
            Filename,
            ContentType,
            Title,
            IsPrivateDocument,
            UploadByUsername,
            IsPublishedToEmployee
        from openjson(
            (
                select
                    d.ID,
                    FSDocument,
                    Extension,
                    CompanyID = case
                        when d.CompanyID is NULL then c.ID
                        else d.CompanyID
                    end,
                    Filename,
                    ContentType,
                    Title,
                    IsPrivateDocument = case
                        when d.IsPrivateDocument is null then 0
                        else d.IsPrivateDocument
                    end,
                    UploadByUsername,
                    IsPublishedToEmployee
                from
                    dbo.Document d
                inner join dbo.Company c on c.ID = d.CompanyID
                where
                    d.ID = @_documentId for json auto
            )
        ) with (
            ID int,
            FSDocument nvarchar(max),
            Extension nvarchar(max),
            CompanyID int,
            Filename nvarchar(max),
            ContentType nvarchar(max),
            Title nvarchar(max),
            IsPrivateDocument bit,
            UploadByUsername nvarchar(max),
            IsPublishedToEmployee bit
        )
    end
