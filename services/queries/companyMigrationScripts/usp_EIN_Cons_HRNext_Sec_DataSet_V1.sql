/*-----------------------------------------------------------------
 usp_EIN_Cons_HRNext_Sec_DataSet_V1
-----------------------------------------------------------------*/
/*
	Syntax	: exec  usp_EIN_Cons_HRNext_Sec_DataSet_V1
		Ex.	: 	
			execute usp_EIN_Cons_HRNext_Sec_DataSet_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 1, '600373', '600351', 'ShowData', 'j'
			execute usp_EIN_Cons_HRNext_Sec_DataSet_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'Insert', 'ZZZ'
			execute usp_EIN_Cons_HRNext_Sec_DataSet_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'InsertFullValidate', 'ZZZ'
			execute usp_EIN_Cons_HRNext_Sec_DataSet_V1 '[adhr-1].[dbo].', '[adhr-2].[dbo].', 1, 0, '600373', '600351', 'Delete', 'ZZZ'
		
	Purpose	:

	Params	: none. 
	Calls	: none.
	Returns	: none.
	Special	: none.
	Notes	: none.
	Author	: Tom Signor	Date : 04/28/21
	Notice	: Copyright (c) 2021 Asure Inc., All Rights Reserved.

	Last Mod	:
*/
/*-----------------------------------------------------------------*/
/*	First Drop Proc dbo.usp_EIN_Cons_HRNext_Sec_DataSet_V1 */
	if object_id('dbo.usp_EIN_Cons_HRNext_Sec_DataSet_V1') is not null
	begin
		drop procedure dbo.usp_EIN_Cons_HRNext_Sec_DataSet_V1
		print 'Dropped Proc dbo.usp_EIN_Cons_HRNext_Sec_DataSet_V1 '
	end
GO

	create procedure usp_EIN_Cons_HRNext_Sec_DataSet_V1
	
		@cDonorDatabasePath		char(75),
		@cRecipientDatabasePath	char(75),
		@cVerbose_Ind			bit,
		@cShowStatement			bit,
		@cRecipientCompany_ID	char(8),
		@cDonorCompany_ID		char(8),
		@cValidateType_Cd		char(20),
		@cTableToRun			char(50)

	with encryption
	as

	--setup Exist vars
	declare @nDonorExistCount tinyint
	select @nDonorExistCount = 1
	declare @nRecipientExistCount tinyint
	select @nRecipientExistCount = 0
	declare @cDonorCountPath nvarchar(100)
	declare @cRecipientCountPath char(100)

	--setup Fail vars
	declare @cFailCodes char(256)
	select  @cFailCodes = ''

	declare @cmdColumns nvarchar(max)
	declare @cmdSelect nvarchar(max)
	declare @cmdInsert nvarchar(max)
	declare @cmdCombine nvarchar(max)
	declare @cmdCountDataDonor nvarchar(max)
	declare @cmdCountDataRecipient nvarchar(max)
	declare @cmdShowDataDonor nvarchar(max)
	declare @cmdShowDataRecipient nvarchar(max)
	declare @cDonorTablePath char(75)
	declare @cRecipientTablePath char(75)
	declare @cDonorCompanyID char(8)
	declare @cRecipientCompanyID char(8)
	declare @ColumnName nvarchar(max)

	select @cDonorTablePath = @cDonorDatabasePath --'[adhr-1].[dbo].'
	select @cRecipientTablePath = @cRecipientDatabasePath --'[adhr-2].[dbo].'

	set nocount on
	
	-- ------------------------------------------------------------
	-- This Query just returns the data from Donor system without verifiyng or moving anything
	if @cValidateType_Cd = 'ShowData'
	
	begin
		if @cTableToRun = 'ZZZ' or @cTableToRun like '%A%'
		begin
			select @cmdShowDataRecipient = 'select 
				D1.Username,
				D1.PasswordHash,
				D1.PasswordSalt,
				D1.OldPasswordEncrypted,
				D1.OldASPNETUserID,
				D1.AuthKey,
				D1.TokenID,
				D1.FirstName,
				D1.LastName,
				D1.IsActive,
				D1.LockedOutUntilDate,
				D1.CreateDate,
				D1.LastPasswordChangedDate,
				D1.Comment,
				D1.IntegrationPayEntryUsername, 
				D1.IntegrationPayEntryPassword, 
				D1.IntegrationPayEntryIsMultiCompanyUser, 
				D1.IntegrationShugoUsername,
				D1.IntegrationNCSUsername, 
				D1.IntegrationHRAnswerLinkUsername, 
				D1.IntegrationThinkHRUsername, 
				D1.TimezoneInfoID,
				D1.IsGA,
				D1.FailedLoginTryAttempt,
				D1.TFASetupCompleted,
				D1.TFAActive,
				D1.IsSuperAdmin,
				D1.IsServiceBureauAdmin,
				D1.IntegrationRPOUsername,
				D1.IntegrationRPOPassword,
				D1.IntegrationRPOIsMultiCompanyUser,
				D1.IsPayrollRightsGranted_EVO,
				D1.IsCompanyRightsGranted_EVO,
				D1.IsEmployeeRightsGranted_EVO,
				D1.PR_Integration_PK,
				D1.EvoFK_Username,
				D1.IntegrationRPOSSOKey
			from '+trim(@cDonorTablePath)+'HRnextUser D1
			join '+trim(@cDonorTablePath)+'HRnextUserCompany D2 on D2.HRnextUserID = D1.ID 
			where D2.CompanyID = '+@cDonorCompany_ID+' and D1.Username not in (select Username from '+trim(@cRecipientTablePath)+'HRNextUser)'
			
			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'HRNext - A' as Showdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%B%'
		begin
			select @cmdShowDataRecipient = 'select R1.ID, '+@cRecipientCompany_ID+'
			from '+trim(@cDonorTablePath)+'HRnextUser D1
			join '+trim(@cRecipientTablePath)+'HRnextUser R1 on R1.Username = D1.Username
			join '+trim(@cDonorTablePath)+'HRnextUserCompany D2 on D2.HRnextUserID = D1.ID
			where D2.CompanyID = '+@cDonorCompany_ID
			
			--select D1.ID, D1.IntegrationShugoUsername
			--from '+trim(@cRecipientTablePath)+'HRnextUser D1
			--where D1.IntegrationShugoUsername = '+@cRecipientCompany_ID

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'HRNextUser HRnextUserCompany - B' as Showdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%C%'
		begin
			select @cmdShowDataRecipient = 'select R1.ID, R2.ID
			from '+trim(@cDonorTablePath)+'HRnextUser D1
			join '+trim(@cRecipientTablePath)+'HRnextUser R1 on R1.Username = D1.Username
			join '+trim(@cDonorTablePath)+'HRnextUserEmployee D2 on D2.HRnextUserID = D1.ID
			join '+trim(@cDonorTablePath)+'Employee D3 on D3.ID = D2.EmployeeID
			join '+trim(@cRecipientTablePath)+'Employee R2 on R2.EmployeeCode = D3.EmployeeCode
			where D3.CompanyID = '+@cDonorCompany_ID
			
			--select D1.ID, D1.IntegrationHRAnswerLinkUsername
			--from '+trim(@cRecipientTablePath)+'HRnextUser D1
			--where D1.IntegrationShugoUsername = '+@cRecipientCompany_ID

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'HRNextUser HRnextUserEmployee - C' as Showdata
			end
		end

		-- if @cTableToRun = 'ZZZ' or @cTableToRun like '%D%'
		-- begin
		-- 	--SecRole Ready
		-- 	select @cmdShowDataRecipient = 'select D1.Name, D1.Description, D1.TenantId, D1.RoleLevelID, '+@cRecipientCompany_ID+', D1.ReadOnlyRoleLevelID, D1.SecEmployeeRecordFilterID, D1.BaseRoleID, D1.IsBaseRole
		-- 	from '+trim(@cDonorTablePath)+'SecRole D1
		-- 	left outer join '+trim(@cDonorTablePath)+'SecRole D2 on D2.ID = D1.BaseRoleID
		-- 	left outer join '+trim(@cRecipientTablePath)+'SecRole R1 on R1.Name = D2.Name
		-- 	where D1.companyid = '+@cDonorCompany_ID

		-- 	exec (@cmdShowDataRecipient)
		-- 	if @cShowStatement = 1
		-- 	begin
		-- 		select @cmdShowDataRecipient
		-- 	end
		-- 	if @cVerbose_Ind = 1
		-- 	begin
		-- 		select 'SecRole - D' as Showdata
		-- 	end
		-- end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%G%'
		begin
			select @cmdShowDataRecipient = 'select distinct D1.*
			from '+trim(@cDonorTablePath)+'HRnextAudit D1
			join '+trim(@cDonorTablePath)+'HRnextAuditDetail D4 on D4.HRnextAuditID = D1.ID
			where D4.CompanyID = '+@cDonorCompany_ID

			--join '+trim(@cDonorTablePath)+'HRnextUser D2 on D2.Username = D1.Username
			--join '+trim(@cDonorTablePath)+'HRnextUserCompany D3 on D3.HRNextUserID = D2.ID

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'HRNextAudit - G' as Showdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%H%'
		begin
			select @cmdShowDataRecipient = 'select R1.*, D2.*, D1.*
			from '+trim(@cDonorTablePath)+'HRnextAuditDetail D1
			join '+trim(@cDonorTablePath)+'HRnextAudit D2 on D2.ID = D1.HRNextAuditID
			join '+trim(@cRecipientTablePath)+'HRnextAudit R1 on R1.TransactionName = D2.TransactionName and R1.UserName = D2.UserName and R1.AuditDate = D2.AuditDate
			where D1.CompanyID = '+@cDonorCompany_ID
			--join '+trim(@cDonorTablePath)+'HRnextUser D3 on D3.Username = D2.Username
			--join '+trim(@cDonorTablePath)+'HRnextUserCompany D4 on D4.HRNextUserID = D3.ID

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'HRNextAuditDetail - H' as Showdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%I%'
		begin
			select @ColumnName = 'trim(str(R2.ID))'
			select @cmdShowDataRecipient = 'select '''+@cRecipientCompany_ID+'@''+'+@ColumnName+'+''&'',T1.Name, T1.Description, 
			T1.ResourceID, T1.ResourceGroupID, T1.ResourceSubGroupID, T1.IsVisible, T1.IsRead, T1.IsCreate, T1.IsUpdate, T1.IsDelete, T1.IsRequired, T1.CddID, T1.TableColumn, T1.Category
			from '+trim(@cDonorTablePath)+'SecPermission T1
			left join '+trim(@cDonorTablePath)+'SecPermissionRole D1 on D1.PermissionID = T1.ID
			left join '+trim(@cDonorTablePath)+'SecRole D2 on D2.ID = D1.RoleID
			join '+trim(@cRecipientTablePath)+'SecRole R2 on R2.Name = D2.Name and R2.Description = D2.Description 
			where D2.CompanyID = '+@cDonorCompany_ID+' and R2.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end

			if @cVerbose_Ind = 1
			begin
				select 'SecPermission/SecPermissionRole - I' as Showdata
			end
		end

		----------------------------------------------------
		if @cTableToRun = 'ZZZ' or @cTableToRun like '%J%'
		begin
			--select @cmdShowDataRecipient = 'select D1.*
			--from '+trim(@cDonorTablePath)+'Company D1 where D1.ID = '+@cDonorCompany_ID+'
			--union select R1.* from'+trim(@cRecipientTablePath)+'Company R1 where R1.ID = '+@cRecipientCompany_ID

			select @cmdShowDataRecipient = 'select R1.ID, D1.SC_AdminUsername, SC_AdminPassword, SC_SSOUsername, SC_SSOPassword, SC_SSOClockCard2, SC_SSOClockCard3
			from '+trim(@cDonorTablePath)+'UserCompanyTimeclockCredential D1
			join '+trim(@cDonorTablePath)+'HRnextUser D2 on D1.HRnextUserID = D2.ID
			join '+trim(@cRecipientTablePath)+'HRnextUser R1 on D2.Username = R1.Username
			where D1.CompanyID = '+@cDonorCompany_ID

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'Company TimeClock Credentials Update - J' as Showdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%K%'
		begin
			select @cmdShowDataRecipient = '
			select donor_hu.ID, donor_hu.Username, donor_huc.CompanyID, donor_hu.IsActive
			from '+trim(@cDonorTablePath)+'HRnextUser donor_hu
			join '+trim(@cDonorTablePath)+'HRnextUserCompany donor_huc on donor_huc.HRnextUserID = donor_hu.ID
			where donor_huc.CompanyID = '+@cDonorCompany_ID

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'Inactivate Users in Donor - K' as Showdata
			end
		end

		select @cFailCodes = 'ShowData'
	
	end

	-- ------------------------------------------------------------
	-- These Queries determine wether an insert should continue
	if @nDonorExistCount = 0 
		select @cFailCodes = 'NoDonorExists', @cValidateType_Cd = 'ExitPGM'
	if @nRecipientExistCount > 0 
		select @cFailCodes = 'RecipientExists', @cValidateType_Cd = 'ExitPGM'

	-- This Query loads the data from Donor
	if @cValidateType_Cd = 'Insert'
	
	begin

		--select ID from [adhr-1].[dbo].Employee where CompanyID = @cDonorCompany_ID
		if @cTableToRun = 'ZZZ' or @cTableToRun like '%A%'
		begin
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'HRnextUser (
				Username,
				PasswordHash,
				PasswordSalt,
				OldPasswordEncrypted,
				OldASPNETUserID,
				AuthKey,
				TokenID,
				FirstName,
				LastName,
				IsActive,
				LockedOutUntilDate,
				CreateDate,
				LastPasswordChangedDate,
				Comment,
				IntegrationPayEntryUsername,
				IntegrationPayEntryPassword,
				IntegrationPayEntryIsMultiCompanyUser,
				IntegrationShugoUsername,
				IntegrationNCSUsername,
				IntegrationHRAnswerLinkUsername,
				IntegrationThinkHRUsername,
				TimezoneInfoID,
				IsGA,
				FailedLoginTryAttempt,
				TFASetupCompleted,
				TFAActive,
				IsSuperAdmin,
				IsServiceBureauAdmin,
				IntegrationRPOUsername,
				IntegrationRPOPassword,
				IntegrationRPOIsMultiCompanyUser,
				IsPayrollRightsGranted_EVO,
				IsCompanyRightsGranted_EVO,
				IsEmployeeRightsGranted_EVO,
				PR_Integration_PK,
				EvoFK_Username,
				IntegrationRPOSSOKey
			)'
			select @cmdInsert = @cmdInsert + '
			select 
				D1.Username,
				D1.PasswordHash,
				D1.PasswordSalt,
				D1.OldPasswordEncrypted,
				D1.OldASPNETUserID,
				D1.AuthKey,
				D1.TokenID,
				D1.FirstName,
				D1.LastName,
				D1.IsActive,
				D1.LockedOutUntilDate,
				D1.CreateDate,
				D1.LastPasswordChangedDate,
				D1.Comment,
				D1.IntegrationPayEntryUsername, 
				D1.IntegrationPayEntryPassword, 
				D1.IntegrationPayEntryIsMultiCompanyUser, 
				D1.IntegrationShugoUsername,
				D1.IntegrationNCSUsername, 
				D1.IntegrationHRAnswerLinkUsername, 
				D1.IntegrationThinkHRUsername, 
				D1.TimezoneInfoID,
				D1.IsGA,
				D1.FailedLoginTryAttempt,
				D1.TFASetupCompleted,
				D1.TFAActive,
				D1.IsSuperAdmin,
				D1.IsServiceBureauAdmin,
				D1.IntegrationRPOUsername,
				D1.IntegrationRPOPassword,
				D1.IntegrationRPOIsMultiCompanyUser,
				D1.IsPayrollRightsGranted_EVO,
				D1.IsCompanyRightsGranted_EVO,
				D1.IsEmployeeRightsGranted_EVO,
				D1.PR_Integration_PK,
				D1.EvoFK_Username,
				D1.IntegrationRPOSSOKey
			from '+trim(@cDonorTablePath)+'HRnextUser D1
			join '+trim(@cDonorTablePath)+'HRnextUserCompany D2 on D2.HRnextUserID = D1.ID 
			where D2.CompanyID = '+@cDonorCompany_ID+' and D1.Username not in (select Username from '+trim(@cRecipientTablePath)+'HRNextUser)'

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'HRNext - A' as Insertdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%B%'
		begin
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'HRnextUserCompany (HRnextUserID, CompanyID)
			select R1.ID, '+@cRecipientCompany_ID+'
			from '+trim(@cDonorTablePath)+'HRnextUser D1
			join '+trim(@cRecipientTablePath)+'HRnextUser R1 on R1.Username = D1.Username
			join '+trim(@cDonorTablePath)+'HRnextUserCompany D2 on D2.HRnextUserID = D1.ID
			where D2.CompanyID = '+@cDonorCompany_ID
			
			--select D1.ID, D1.IntegrationShugoUsername
			--from '+trim(@cRecipientTablePath)+'HRnextUser D1
			--where D1.IntegrationShugoUsername = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'HRNextUserCompany - B' as Insertdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%C%'
		begin
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'HRnextUserEmployee (HRnextUserID, EmployeeID)
			select R1.ID, R2.ID
			from '+trim(@cDonorTablePath)+'HRnextUser D1
			join '+trim(@cRecipientTablePath)+'HRnextUser R1 on R1.Username = D1.Username
			join '+trim(@cDonorTablePath)+'HRnextUserEmployee D2 on D2.HRnextUserID = D1.ID
			join '+trim(@cDonorTablePath)+'Employee D3 on D3.ID = D2.EmployeeID
			join '+trim(@cRecipientTablePath)+'Employee R2 on R2.EmployeeCode = D3.EmployeeCode
			where D3.CompanyID = '+@cDonorCompany_ID+' and R2.CompanyID = '+@cRecipientCompany_ID

			--select D1.ID, D1.IntegrationHRAnswerLinkUsername
			--from '+trim(@cRecipientTablePath)+'HRnextUser D1
			--where D1.IntegrationShugoUsername = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'HRnextUserEmployee - C' as Insertdata
			end
		end

		/*if @cTableToRun = 'ZZZ' or @cTableToRun like '%D%'
		begin
		--SecRole Ready
			select @cmdInsert = 'delete from '+trim(@cRecipientTablePath)+'SecPermissionRole where RoleID in (select ID from '+trim(@cRecipientTablePath)+'SecRole where CompanyID = '+@cRecipientCompany_ID+')'
			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			--select @cmdInsert = 'delete from '+trim(@cRecipientTablePath)+'SecPermission where CompanyID = '+@cRecipientCompany_ID
			--exec (@cmdInsert)
			--if @cShowStatement = 1
			--begin
			--	select @cmdInsert
			--end
			select @cmdInsert = 'delete from '+trim(@cRecipientTablePath)+'SecRole where CompanyID = '+@cRecipientCompany_ID
			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'SecPermissionRole/SecPermission/SecRole Delete - D' as Insertdata
			end

			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'SecRole (Name, Description, TenantId, RoleLevelID, CompanyID, ReadOnlyRoleLevelID, SecEmployeeRecordFilterID, BaseRoleID, IsBaseRole)
			select D1.Name, D1.Description, NULL as TenantID, R2.ID as RoleLevelID, '+@cRecipientCompany_ID+' as CompanyID, R3.ID as ReadOnlyRoleLevelID, R4.ID as SecEmployeeRecordFilterID, NULL as BaseRoleID, D1.IsBaseRole
			from '+trim(@cDonorTablePath)+'SecRole D1

			left outer join '+trim(@cDonorTablePath)+'SecRoleLevel D2 on D2.ID = D1.RoleLevelID
			left outer join '+trim(@cRecipientTablePath)+'SecRoleLevel R2 on R2.Name = D2.Name and R2.Description = D2.Description

			left outer join '+trim(@cDonorTablePath)+'SecRoleLevel D3 on D3.ID = D1.ReadOnlyRoleLevelID
			left outer join '+trim(@cRecipientTablePath)+'SecRoleLevel R3 on R3.Name = D3.Name and R3.Description = D3.Description

			left outer join '+trim(@cDonorTablePath)+'SecEmployeeRecordFilter D4 on D4.ID = D1.SecEmployeeRecordFilterID
			left outer join '+trim(@cRecipientTablePath)+'SecEmployeeRecordFilter R4 on R4.Name = D4.Name and R4.Description = D4.Description

			where D1.companyid = '+@cDonorCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'SecRole Insert - D' as Insertdata
			end
		end*/

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%E%'
		begin
			--SecRoleUser
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'SecRoleUser (RoleID, UserID)
				select recip_sr.ID as RoleID, recip_u.ID as UserID
				from '+trim(@cDonorTablePath)+'SecRoleUser donor_sru
				join '+trim(@cDonorTablePath)+'SecRole donor_sr on donor_sr.ID = donor_sru.RoleID
				join '+trim(@cRecipientTablePath)+'SecRole recip_sr on recip_sr.Description = donor_sr.Description -- Role Name can change if recip CompanyCode is different so use Description instead 

				join '+trim(@cDonorTablePath)+'HRnextUser donor_u on donor_u.ID = donor_sru.UserID
				join '+trim(@cRecipientTablePath)+'HRnextUser recip_u on recip_u.Username = donor_u.Username

				where donor_sr.CompanyID = '+@cDonorCompany_ID+' and recip_sr.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'SecRoleUser - E' as Insertdata
			end
		end

		-- if @cTableToRun = 'ZZZ' or @cTableToRun like '%F%'
		-- begin
		-- 	select @cmdInsert = 'update '+trim(@cRecipientTablePath)+'HRnextUser
		-- 	set IntegrationPayEntryUsername = null, IntegrationPayEntryPassword = null, IntegrationShugoUsername = null, 
		-- 	IntegrationNCSUsername = null, IntegrationHRAnswerLinkUsername = null, IntegrationThinkHRUsername = null
		-- 	where IntegrationShugoUsername = '+@cRecipientCompany_ID

		-- 	exec (@cmdInsert)
		-- 	if @cShowStatement = 1
		-- 	begin
		-- 		select @cmdInsert
		-- 	end
		-- 	if @cVerbose_Ind = 1
		-- 	begin
		-- 		select 'HRnextUser/Cleanup - F' as Insertdata
		-- 	end
		-- end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%G%'
		begin
			select @cmdInsert = 'insert into'+trim(@cRecipientTablePath)+'HRnextAudit (D1.TransactionName, D1.UserName, D1.AuditDate)
			select distinct D1.TransactionName, D1.UserName, D1.AuditDate
			from '+trim(@cDonorTablePath)+'HRnextAudit D1
			join '+trim(@cDonorTablePath)+'HRnextAuditDetail D4 on D4.HRnextAuditID = D1.ID
			where D4.CompanyID = '+@cDonorCompany_ID

			--	join '+trim(@cDonorTablePath)+'HRnextUser D2 on D2.Username = D1.Username
			--join '+trim(@cDonorTablePath)+'HRnextUserCompany D3 on D3.HRNextUserID = D2.ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'HRnextAudit - G' as Insertdata
			end
		end

				if @cTableToRun = 'ZZZ' or @cTableToRun like '%H%'
		begin
			select @cmdInsert = 'insert into'+trim(@cRecipientTablePath)+'HRnextAuditDetail (HRnextAuditID, CompanyID, AffectedEmployee, ActionType, FieldChanged, OldValue, NewValue, AreaOfChange, KeyDetails)
			select R1.ID, '+@cRecipientCompany_ID+' as CompanyID, D1.AffectedEmployee, D1.ActionType, D1.FieldChanged, D1.OldValue, D1.NewValue, D1.AreaOfChange, D1.KeyDetails
			from '+trim(@cDonorTablePath)+'HRnextAuditDetail D1
			join '+trim(@cDonorTablePath)+'HRnextAudit D2 on D2.ID = D1.HRNextAuditID
			join '+trim(@cRecipientTablePath)+'HRnextAudit R1 on R1.TransactionName = D2.TransactionName and R1.UserName = D2.UserName and R1.AuditDate = D2.AuditDate
			where D1.CompanyID = '+@cDonorCompany_ID

			--join '+trim(@cDonorTablePath)+'HRnextUser D3 on D3.Username = D2.Username
			--join '+trim(@cDonorTablePath)+'HRnextUserCompany D4 on D4.HRNextUserID = D3.ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'HRnextAuditDetail - H' as Insertdata
			end
		end

		/*if @cTableToRun = 'ZZZ' or @cTableToRun like '%I%'
		begin
			select @ColumnName = 'trim(str(R2.ID))'
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'SecPermission (Name, Description, ResourceID, ResourceGroupID, ResourceSubGroupID, IsVisible, IsRead, IsCreate, IsUpdate, IsDelete, IsRequired, CddID, TableColumn, Category)
			select '''+trim(@cRecipientCompany_ID)+'@''+'+@ColumnName+'+''&''+T1.Name, T1.Description, 
			T1.ResourceID, T1.ResourceGroupID, T1.ResourceSubGroupID, T1.IsVisible, T1.IsRead, T1.IsCreate, T1.IsUpdate, T1.IsDelete, T1.IsRequired, T1.CddID, T1.TableColumn, T1.Category
			from '+trim(@cDonorTablePath)+'SecPermission T1
			left join '+trim(@cDonorTablePath)+'SecPermissionRole D1 on D1.PermissionID = T1.ID
			left join '+trim(@cDonorTablePath)+'SecRole D2 on D2.ID = D1.RoleID
			join '+trim(@cRecipientTablePath)+'SecRole R2 on R2.Name = D2.Name and R2.Description = D2.Description 
			where D2.CompanyID = '+@cDonorCompany_ID+' and R2.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end

			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'SecPermissionRole (PermissionID, RoleID)
			select R2.ID, R1.ID
			from '+trim(@cDonorTablePath)+'dbo.SecPermissionRole D1
			join '+trim(@cDonorTablePath)+'dbo.SecRole D2 on D1.RoleID = D2.ID
			join '+trim(@cRecipientTablePath)+'SecRole R1 on R1.Name = D2.Name
			join '+trim(@cDonorTablePath)+'dbo.SecPermission D3 on D1.PermissionID = D3.ID
			join '+trim(@cRecipientTablePath)+'SecPermission R2 on R2.Category = D3.Category
			where D2.CompanyID = '+@cDonorCompany_ID+' and R1.CompanyID = '+@cRecipientCompany_ID

			--select ID as PermissionID, SUBSTRING(Name, CHARINDEX(''@'', Name)+1, CHARINDEX(''&'',Name) - CHARINDEX(''@'', Name) + Len(''&'')-2) as RoleID
			--from '+trim(@cRecipientTablePath)+'SecPermission where name like ''%'+trim(@cRecipientCompany_ID)+'%'''

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end

			select @cmdInsert = 'update '+trim(@cRecipientTablePath)+'SecPermission set Name = 	right(Name, len(name)-charindex(''&'',Name)) where name like ''%'+trim(@cRecipientCompany_ID)+'%'''

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end

			if @cVerbose_Ind = 1
			begin
				select 'SecPermission/SecPermissionRole - I' as InsertDatadata
			end
		end*/

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%J%'
		begin
			--select @cmdShowDataRecipient = 'select D1.*
			--from '+trim(@cDonorTablePath)+'Company D1 where D1.ID = '+@cDonorCompany_ID+'
			--union select R1.* from'+trim(@cRecipientTablePath)+'Company R1 where R1.ID = '+@cRecipientCompany_ID

			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'UserCompanyTimeclockCredential (HRnextUserID, CompanyID, SC_AdminUsername, SC_AdminPassword, SC_SSOUsername, SC_SSOPassword, SC_SSOClockCard2, SC_SSOClockCard3)
			select R1.ID, '+@cRecipientCompany_ID+' as CompanyID, D1.SC_AdminUsername, SC_AdminPassword, SC_SSOUsername, SC_SSOPassword, SC_SSOClockCard2, SC_SSOClockCard3
			from '+trim(@cDonorTablePath)+'UserCompanyTimeclockCredential D1
			join '+trim(@cDonorTablePath)+'HRnextUser D2 on D1.HRnextUserID = D2.ID
			join '+trim(@cRecipientTablePath)+'HRnextUser R1 on D2.Username = R1.Username
			where D1.CompanyID = '+@cDonorCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'Company TimeClock Credentials Update - F' as Showdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%K%'
		begin
			select @cmdInsert = '
			update donor_hu
			set donor_hu.IsActive = 0
			from '+trim(@cDonorTablePath)+'HRnextUser donor_hu
			join '+trim(@cDonorTablePath)+'HRnextUserCompany donor_huc on donor_huc.HRnextUserID = donor_hu.ID
			where donor_huc.CompanyID = '+@cDonorCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'Inactivate Users in Donor - K' as Insertdata
			end
		end

		select  @cFailCodes = 'Insert'

	end

	-- This Query verifies and loads the data from Donor

	if @cValidateType_Cd = 'InsertFullValidate'
	
	begin

		select  @cFailCodes = 'InsertFullValidate Not Available At This Time'
				
	end

	-- This Query deletes the data from Receiver system
	if @cValidateType_Cd = 'Delete'
	
	begin

		--This is the Recipient table
		--select @cmdShowDataDonor = 'delete from '+trim(@cRecipientTablePath)+trim(@cTableName)+' where CompanyID = '+@cRecipientCompany_ID
		--exec (@cmdShowDataDonor)
		select  @cFailCodes = 'Delete Not Available At This Time'
	
	end
	
	select @cFailCodes as 'Return Code'

ExitPgm:
return 0
GO

/*	Now check to make sure it has been created (dbo.usp_EIN_Cons_HRNext_Sec_DataSet_V1 ) */ 
	if object_id('dbo.usp_EIN_Cons_HRNext_Sec_DataSet_V1') is not null
		print 'Proc dbo.usp_EIN_Cons_HRNext_Sec_DataSet_V1 has been CREATED Successfully. '
	else
		print 'Create Proc dbo.usp_EIN_Cons_HRNext_Sec_DataSet_V1 FAILED'
GO

/*	now Grant Permissions on dbo.usp_EIN_Cons_HRNext_Sec_DataSet_V1 to public */
	grant execute on dbo.usp_EIN_Cons_HRNext_Sec_DataSet_V1 to public
	print 'Execute rights have been GRANTED to group public on usp_EIN_Cons_HRNext_Sec_DataSet_V1'
GO
  
/*-----------------------------------------------------------------
	eof -  usp_EIN_Cons_HRNext_Sec_DataSet_V1.sql 
-----------------------------------------------------------------*/