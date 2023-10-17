select PRIntegration_ClientID, PR_Integration_PK 
from Company c
		inner join PRServiceLocation sl on sl.id = c.PRServiceLocationID
		inner join PRIntegrationType i on i.id = sl.PRIntegrationTypeID and i.Code = 'EVO'
where c.id = @CompanyID