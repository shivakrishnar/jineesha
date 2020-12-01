declare @_eisgnLegacyCutoff date = @esignLegacyCutoff
select db_name() as tenantID, concat(CompanyName, ' (', PRIntegrationCompanyCode, ')') as company, count(CompanyID) as billableDocuments
from dbo.EsignatureMetadata e join dbo.Company c on e.CompanyID =  c.ID
where [Type] = 'SignatureRequest' and
SignatureStatusID <> 3 and
MONTH(UploadDate) = 11 and
YEAR(UploadDate) = 2020 and
FileMetadataID is null and
((c.CreateDate <= @_eisgnLegacyCutoff and IsOnboardingDocument = 0) or c.CreateDate > @_eisgnLegacyCutoff)
group by CompanyName, PRIntegrationCompanyCode