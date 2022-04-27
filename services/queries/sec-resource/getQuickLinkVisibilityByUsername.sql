select hnu.Username, sp.Name, sp.IsVisible from dbo.HRnextUser hnu
	inner join dbo.SecRoleUser sru on hnu.ID = sru.UserID
	inner join dbo.SecPermissionRole spr on sru.RoleID = spr.RoleID
	inner join dbo.SecPermission sp on spr.PermissionID = sp.ID
where Name = '@quickLink' and Username = '@username'