
select
	companyId = alt.CompanyID,
	IncludeEmployee = alt.RecipientIncludeTarget,
	includeSupervisor1 = alt.RecipientIncludeReportsTo1,
	includeSupervisor2 = alt.RecipientIncludeReportsTo2,
	includeSupervisor3 = alt.RecipientIncludeReportsTo3,
	emailBodyTemplate = alt.TemplateBody,
	emailSubjectTemplate = alt.TemplateSubject,
    recipientEmployeesIds = alt.RecipientKeysEmployee,  -- string delimited
	recipientUsersIds = alt.RecipientKeysUser       -- string delimited
	
from
	dbo.Alert alt
	inner join dbo.AlertSystemType ast on alt.AlertSystemTypeID = ast.ID
	inner join dbo.AlertCategoryType act on ast.AlertCategoryTypeID = act.ID
where
	alt.CompanyID = @companyId
	and alt.Active = 1
	and trim(act.Name) = @alertCategoryType 
	and trim(ast.Name) = @action