select
	Roles.ID as roleId,
	Roles.Name as roleName,
	Roles.IsAdmin as isAdmin,
	Roles.SystemID as systemId,
	Systems.Name as systemName,
	Systems.Description as systemDescription,
	RoleClaims.ID as roleClaimsId,
	RoleClaims.ClaimID as claimId,
	Claims.Value as claimsValue,
	Claims.Description as claimsDescription,
	RoleClaims.CanAdd as canAdd,
	RoleClaims.CanEdit as canEdit,
	RoleClaims.CanDelete as canDelete,
	RoleCompanies.ID as roleCompaniesId,
	RoleCompanies.CompanyID as companyId,
	Company.CompanyName as companyName,
	RoleUsers.ID as roleUsersId,
	RoleUsers.UserID as userId,
	HRnextUser.UserName as userName
from
	Roles inner join
	Systems on Roles.SystemID = Systems.ID inner join
	RoleClaims on Roles.ID = RoleClaims.RoleID inner join
	Claims on RoleClaims.ClaimID = Claims.ID left join
	RoleCompanies on Roles.ID = RoleCompanies.RoleID left join
	Company on RoleCompanies.CompanyID = Company.ID left join
	RoleUsers on Roles.ID = RoleUsers.RoleID left join
	HRnextUser on RoleUsers.UserID = HRnextUser.ID
where
	HRnextUser.UserName = @UserName
order by
	SystemName,
	CompanyName,
	UserName