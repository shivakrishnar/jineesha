select
	Roles.ID as RoleID,
	Roles.Name as RoleName,
	Roles.IsAdmin,
	Roles.SystemID,
	Systems.Name as SystemName,
	Systems.Description as SystemDescription,
	RoleClaims.ID as RoleClaimsID,
	RoleClaims.ClaimID,
	Claims.Value as ClaimsValue,
	Claims.Description as ClaimsDescription,
	RoleClaims.CanAdd,
	RoleClaims.CanEdit,
	RoleClaims.CanDelete,
	RoleCompanies.ID as RoleCompaniesID,
	RoleCompanies.CompanyID,
	Company.CompanyName,
	RoleUsers.ID as RoleUsersID,
	RoleUsers.UserID,
	HRnextUser.UserName
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