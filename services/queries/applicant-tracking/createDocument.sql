

declare @_fileName as nvarchar(200) = '@fileName';
declare @_extension as nvarchar(20) = '@extension';
declare @_contentType as nvarchar(200) = '@contentType';
declare @_applicationID as nvarchar(max) = '@applicationID';
declare @_content as nvarchar(max) = '@content';
declare @_externalDocumentID as nvarchar(max) = '@externalDocumentID';

declare @_fileSize as int = @fileSize;

declare @_xml XML;
SET @_xml = @_content;

INSERT INTO [dbo].[Document]
           (
            [HRnextAccountID]
           ,[CompanyID]
           ,[EmployeeID]
           ,[DocumentCategory]
           ,[FSRowGuid]
           ,[Title]
           ,[Description]
           ,[Extension]
           ,[Size]
           ,[UploadDate]
           ,[IsPrivateDocument]
           ,[IsPublishedToEmployee]
           ,[Filename]
           ,[ContentType]
           ,[UploadByUsername]
           ,[EmployeeOnboardID]
           ,[ESignDate]
           ,[ESignName]
           ,[ATApplicationID]
           ,[IsPublishedToManager]
           ,[FSDocument]
           ,[FSDocumentTN]
           ,[Pointer]
           ,ExternalDocumentID
          
           )
VALUES
           (
            NULL,
		NULL,
		NULL
           ,'AppTrack-JazzHR'
           ,NEWID()
           ,@_fileName
           ,'Created By JazzHR'
           ,@_extension
           ,@_fileSize
           ,GETDATE()
           ,NULL
           ,NULL
           ,@_fileName
           ,@_contentType
           ,'JazzHR'
           ,NULL
           ,NULL
           ,NULL
           ,CAST(@_applicationID as bigint)
           ,1
           ,@_xml.value('(/)[1]', 'VARBINARY(max)') 
           ,NULL
           ,NULL
           ,CAST(@_externalDocumentID as bigint)
           
           )


      
                 
                 
                 
                 
                 
                 
                 
                 
                 
                 
                 
                 
                 