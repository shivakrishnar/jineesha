update 
    e
set 
    e.IsOnboardingDocument = @isOnboardingDocument
from
  dbo.EsignatureMetadata e join dbo.FileMetadata f on e.ID = f.EsignatureMetadataID
where
  f.ID = @id