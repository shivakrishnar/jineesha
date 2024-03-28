declare @_companyid bigint = @CompanyID

select count(*) as totalCount
from ATJobPosting
where CompanyID = @_companyid

select jp.ID as id,
	   jp.CompanyID as companyId,
	   c.CompanyName as companyName,
	   jp.ATApplicationVersionID as aTApplicationVersionId,
	   jp.PositionTypeID as positionTypeId,
	   jp.OrganizationType1ID as organizationType1Id,
	   jp.OrganizationType2ID as organizationType2Id,
	   jp.OrganizationType3ID as organizationType3Id,
	   jp.OrganizationType4ID as organizationType4Id,
	   jp.OrganizationType5ID as organizationType5Id,
	   jp.WorkerCompTypeID as workerCompTypeId,
	   jp.Title as title,
	   jp.Description as description,
	   jp.LinkKey as linkKey,
	   jp.IsOpen as isOpen,
	   jp.JazzHrPositionOpeningID as jazzHrPositionOpeningId

from ATJobPosting jp
		inner join Company c on c.id = jp.CompanyID
        
where jp.CompanyID = @_companyid
order by jp.Title