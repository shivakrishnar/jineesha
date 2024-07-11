select 
    dit.ID, 
    dit.Name, 
    dit.Description, 
    dit.ImportProcess, 
    dit.LastProgramEvent
from dbo.DataImportType dit 
where dit.Active = 1 and
      dit.ImportProcess like @ImportProcess