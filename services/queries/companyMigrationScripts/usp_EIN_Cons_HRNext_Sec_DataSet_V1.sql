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
		@cRecipientDatabasePath	char(100),
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
	declare @cRecipientTablePath char(100)
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
			join '+trim(@cRecipientTablePath)+'HRnextUser R1 on R1.Username = D1.Username collate Latin1_General_100_CS_AS
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
			join '+trim(@cRecipientTablePath)+'HRnextUser R1 on R1.Username = D1.Username collate Latin1_General_100_CS_AS
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

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%D%'
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
				select 'HRNextAudit - D' as Showdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%E%'
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
				select 'HRNextAuditDetail - E' as Showdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%F%'
		begin
			-- SecEmployeeRecordFilter
			select @cmdShowDataRecipient = '
				select
					donor_srf.Name,
					donor_srf.Description,
					'+@cRecipientCompany_ID+' as CompanyID
				from '+trim(@cDonorTablePath)+'SecEmployeeRecordFilter donor_srf
				where donor_srf.CompanyID = '+@cDonorCompany_ID

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end

			if @cVerbose_Ind = 1
			begin
				select 'SecEmployeeRecordFilter/SecEmployeeRecordFilterValue - F' as Showdata
			end
		end


		if @cTableToRun = 'ZZZ' or @cTableToRun like '%G%'
		begin
			select @cmdShowDataRecipient = '
				select
					donor_sr.Name,
					donor_sr.Description,
					donor_sr.TenantId, -- can this be nulled out? is it ever used?
					recip_srl.ID as RoleLevelID,
					'+@cRecipientCompany_ID+' as CompanyID,
					recip_srl_readonly.ID as ReadOnlyRoleLevelID, 
					recip_srf.ID as SecEmployeeRecordFilterID,
					recip_sr_base.ID as BaseRoleID,
					donor_sr.IsBaseRole
				from '+trim(@cDonorTablePath)+'SecRole donor_sr

				left join '+trim(@cDonorTablePath)+'SecRoleLevel donor_srl on donor_srl.ID = donor_sr.RoleLevelID
				left join '+trim(@cRecipientTablePath)+'SecRoleLevel recip_srl on
					isnull(recip_srl.Description, '''') = isnull(donor_srl.Description, '''')
					and isnull(recip_srl.Level, 0) = isnull(donor_srl.Level, 0)
					and isnull(recip_srl.Name, '''') = isnull(donor_srl.Name, '''')

				left join '+trim(@cDonorTablePath)+'SecRoleLevel donor_srl_readonly on donor_srl_readonly.ID = donor_sr.ReadOnlyRoleLevelID
				left join '+trim(@cRecipientTablePath)+'SecRoleLevel recip_srl_readonly on
					isnull(recip_srl_readonly.Description, '''') = isnull(donor_srl_readonly.Description, '''')
					and isnull(recip_srl_readonly.Level, 0) = isnull(donor_srl_readonly.Level, 0)
					and isnull(recip_srl_readonly.Name, '''') = isnull(donor_srl_readonly.Name, '''')

				left join '+trim(@cDonorTablePath)+'SecEmployeeRecordFilter donor_srf on donor_srf.ID = donor_sr.SecEmployeeRecordFilterID
				left join '+trim(@cRecipientTablePath)+'SecEmployeeRecordFilter recip_srf on
					isnull(recip_srf.Name, '''') = isnull(donor_srf.Name, '''')
					and isnull(recip_srf.Description, '''') = isnull(donor_srf.Description, '''')
					and recip_srf.CompanyID = '+@cRecipientCompany_ID+'

				left join '+trim(@cDonorTablePath)+'SecRole donor_sr_base on donor_sr_base.ID = donor_sr.BaseRoleID
				left join '+trim(@cRecipientTablePath)+'SecRole recip_sr_base on
					isnull(recip_sr_base.Name, '''') = isnull(donor_sr_base.Name, '''')
					and isnull(recip_sr_base.Description, '''') = isnull(donor_sr_base.Description, '''')
					and isnull(recip_sr_base.IsBaseRole, 0) = isnull(donor_sr_base.IsBaseRole, 0)

				where donor_sr.CompanyID = '+@cDonorCompany_ID

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end

			if @cVerbose_Ind = 1
			begin
				select 'SecRole - G' as Showdata
			end

			select @cmdShowDataRecipient = '
				select
					donor_sp.Name,
					donor_sp.Description,
					recip_src.ID as ResourceID,
					recip_srg.ID as ResourceGroupID,
					recip_srsg.ID as ResourceSubGroupID,
					donor_sp.IsVisible,
					donor_sp.IsRead,
					donor_sp.IsCreate,
					donor_sp.IsUpdate,
					donor_sp.IsDelete,
					donor_sp.IsRequired,
					recip_sc.ID as CddID,
					donor_sp.TableColumn,
					donor_sp.Category
				from '+trim(@cDonorTablePath)+'SecPermission donor_sp

				join '+trim(@cDonorTablePath)+'SecPermissionRole donor_spr on donor_spr.PermissionID = donor_sp.ID
				join '+trim(@cDonorTablePath)+'SecRole donor_sr on donor_sr.ID = donor_spr.RoleID

				join '+trim(@cDonorTablePath)+'SecResource donor_src on donor_src.ID = donor_sp.ResourceID
				left join '+trim(@cDonorTablePath)+'SecResourceGroup donor_src_srg on donor_src_srg.ID = donor_src.ResourceGroupID
				left join '+trim(@cRecipientTablePath)+'SecResourceGroup recip_src_srg on
					isnull(recip_src_srg.Name, '''') = isnull(donor_src_srg.Name, '''')
					and isnull(recip_src_srg.Description, '''') = isnull(donor_src_srg.Description, '''')
					and isnull(recip_src_srg.AlternateName, '''') = isnull(donor_src_srg.AlternateName, '''')
					and isnull(recip_src_srg.MainTableName, '''') = isnull(donor_src_srg.MainTableName, '''')
				join '+trim(@cRecipientTablePath)+'SecResource recip_src on
					isnull(recip_src.Name, '''') = isnull(donor_src.Name, '''')
					and isnull(recip_src.Description, '''') = isnull(donor_src.Description, '''')
					and recip_src.ResourceGroupID = recip_src_srg.ID

				left join '+trim(@cDonorTablePath)+'SecResourceGroup donor_srg on donor_srg.ID = donor_sp.ResourceGroupID
				left join '+trim(@cRecipientTablePath)+'SecResourceGroup recip_srg on
					isnull(recip_srg.Name, '''') = isnull(donor_srg.Name, '''')
					and isnull(recip_srg.Description, '''') = isnull(donor_srg.Description, '''')
					and isnull(recip_srg.AlternateName, '''') = isnull(donor_srg.AlternateName, '''')
					and isnull(recip_srg.MainTableName, '''') = isnull(donor_srg.MainTableName, '''')

				left join '+trim(@cDonorTablePath)+'SecResourceSubGroup donor_srsg on donor_srsg.ID = donor_sp.ResourceSubGroupID
				left join '+trim(@cDonorTablePath)+'SecResourceGroup donor_srsg_srg on donor_srsg_srg.ID = donor_srsg.ResourceGroupID
				left join '+trim(@cRecipientTablePath)+'SecResourceGroup recip_srsg_srg on
					isnull(recip_srsg_srg.Name, '''') = isnull(donor_srsg_srg.Name, '''')
					and isnull(recip_srsg_srg.Description, '''') = isnull(donor_srsg_srg.Description, '''')
					and isnull(recip_srsg_srg.MainTableName, '''') = isnull(donor_srsg_srg.MainTableName, '''')
					and isnull(recip_srsg_srg.AlternateName, '''') = isnull(donor_srsg_srg.AlternateName, '''')
				left join '+trim(@cRecipientTablePath)+'SecResourceSubGroup recip_srsg on
					isnull(recip_srsg.Name, '''') = isnull(donor_srsg.Name, '''')
					and isnull(recip_srsg.Description, '''') = isnull(donor_srsg.Description, '''')
					and isnull(recip_srsg.MainTableName, '''') = isnull(donor_srsg.MainTableName, '''')
					and recip_srsg.ResourceGroupID = recip_srsg_srg.ID

				left join '+trim(@cDonorTablePath)+'SecCDD donor_sc on donor_sc.ID = donor_sp.CddID
				left join '+trim(@cRecipientTablePath)+'SecCDD recip_sc on
					isnull(recip_sc.TableName, '''') = isnull(donor_sc.TableName, '''')
					and isnull(recip_sc.ColumnName, '''') = isnull(donor_sc.ColumnName, '''')
					and isnull(recip_sc.DataType, '''') = isnull(donor_sc.DataType, '''')
					and isnull(recip_sc.Length, -1) = isnull(donor_sc.Length, -1)
					and isnull(recip_sc.TableColumn, '''') = isnull(donor_sc.TableColumn, '''')

				where donor_sr.CompanyID = '+@cDonorCompany_ID

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end

			if @cVerbose_Ind = 1
			begin
				select 'SecPermission - G' as Showdata
			end

			if @cVerbose_Ind = 1
			begin
				select 'SecRole/SecPermission/SecPermissionRole/SecPermissionUser/SecRoleUser - G' as Showdata
			end
		end

		----------------------------------------------------
		if @cTableToRun = 'ZZZ' or @cTableToRun like '%H%'
		begin
			select @cmdShowDataRecipient = 'select R1.ID, D1.SC_AdminUsername, SC_AdminPassword, SC_SSOUsername, SC_SSOPassword, SC_SSOClockCard2, SC_SSOClockCard3
			from '+trim(@cDonorTablePath)+'UserCompanyTimeclockCredential D1
			join '+trim(@cDonorTablePath)+'HRnextUser D2 on D1.HRnextUserID = D2.ID
			join '+trim(@cRecipientTablePath)+'HRnextUser R1 on D2.Username = R1.Username collate Latin1_General_100_CS_AS
			where D1.CompanyID = '+@cDonorCompany_ID

			exec (@cmdShowDataRecipient)
			if @cShowStatement = 1
			begin
				select @cmdShowDataRecipient
			end
			if @cVerbose_Ind = 1
			begin
				select 'Company TimeClock Credentials Update - H' as Showdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%I%'
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
				select 'Inactivate Users in Donor - I' as Showdata
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
			join '+trim(@cRecipientTablePath)+'HRnextUser R1 on R1.Username = D1.Username collate Latin1_General_100_CS_AS
			join '+trim(@cDonorTablePath)+'HRnextUserCompany D2 on D2.HRnextUserID = D1.ID
			where D2.CompanyID = '+@cDonorCompany_ID
			
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
			join '+trim(@cRecipientTablePath)+'HRnextUser R1 on R1.Username = D1.Username collate Latin1_General_100_CS_AS
			join '+trim(@cDonorTablePath)+'HRnextUserEmployee D2 on D2.HRnextUserID = D1.ID
			join '+trim(@cDonorTablePath)+'Employee D3 on D3.ID = D2.EmployeeID
			join '+trim(@cRecipientTablePath)+'Employee R2 on R2.EmployeeCode = D3.EmployeeCode
			where D3.CompanyID = '+@cDonorCompany_ID+' and R2.CompanyID = '+@cRecipientCompany_ID

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


		if @cTableToRun = 'ZZZ' or @cTableToRun like '%D%'
		begin
			select @cmdInsert = 'insert into'+trim(@cRecipientTablePath)+'HRnextAudit (D1.TransactionName, D1.UserName, D1.AuditDate)
			select distinct D1.TransactionName, D1.UserName, D1.AuditDate
			from '+trim(@cDonorTablePath)+'HRnextAudit D1
			join '+trim(@cDonorTablePath)+'HRnextAuditDetail D4 on D4.HRnextAuditID = D1.ID
			where D4.CompanyID = '+@cDonorCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'HRnextAudit - D' as Insertdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%E%'
		begin
			select @cmdInsert = 'insert into'+trim(@cRecipientTablePath)+'HRnextAuditDetail (HRnextAuditID, CompanyID, AffectedEmployee, ActionType, FieldChanged, OldValue, NewValue, AreaOfChange, KeyDetails)
			select R1.ID, '+@cRecipientCompany_ID+' as CompanyID, D1.AffectedEmployee, D1.ActionType, D1.FieldChanged, D1.OldValue, D1.NewValue, D1.AreaOfChange, D1.KeyDetails
			from '+trim(@cDonorTablePath)+'HRnextAuditDetail D1
			join '+trim(@cDonorTablePath)+'HRnextAudit D2 on D2.ID = D1.HRNextAuditID
			join '+trim(@cRecipientTablePath)+'HRnextAudit R1 on R1.TransactionName = D2.TransactionName and R1.UserName = D2.UserName and R1.AuditDate = D2.AuditDate
			where D1.CompanyID = '+@cDonorCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'HRnextAuditDetail - E' as Insertdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%F%'
		begin
			select @cmdInsert = '
				insert into '+trim(@cRecipientTablePath)+'SecEmployeeRecordFilter
				(
					Name,
					Description,
					CompanyID
				)
				select
					donor_srf.Name,
					donor_srf.Description,
					'+@cRecipientCompany_ID+' as CompanyID
				from '+trim(@cDonorTablePath)+'SecEmployeeRecordFilter donor_srf
				where donor_srf.CompanyID = '+@cDonorCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'SecEmployeeRecordFilter - F' as Insertdata
			end

			select @cmdInsert = '
				insert into '+trim(@cRecipientTablePath)+'SecEmployeeRecordFilterValue
				(
					SecEmployeeRecordFilterID,
					OrganizationTypeID,
					PositionTypeID,
					IsExclude
				)
				select
					recip_srf.ID as SecEmployeeRecordFilterID,
					recip_ot.ID as OrganizationTypeID,
					recip_pt.ID as PositionTypeID,
					donor_srfv.IsExclude
				from '+trim(@cDonorTablePath)+'SecEmployeeRecordFilterValue donor_srfv

				join '+trim(@cDonorTablePath)+'SecEmployeeRecordFilter donor_srf on donor_srf.ID = donor_srfv.SecEmployeeRecordFilterID
				join '+trim(@cRecipientTablePath)+'SecEmployeeRecordFilter recip_srf on
					recip_srf.Name = donor_srf.Name
					and isnull(recip_srf.Description, '''') = isnull(donor_srf.Description, '''')
					and recip_srf.CompanyID = '+@cRecipientCompany_ID+'

				left join '+trim(@cDonorTablePath)+'OrganizationType donor_ot on donor_ot.ID = donor_srfv.OrganizationTypeID
				left join '+trim(@cDonorTablePath)+'OrganizationStructure donor_os on donor_os.ID = donor_ot.OrganizationStructureID
				left join '+trim(@cRecipientTablePath)+'OrganizationStructure recip_os on
					recip_os.CompanyID = recip_srf.CompanyID
					and recip_os.Org1Label = donor_os.Org1Label
					and recip_os.Org2Label = donor_os.Org2Label
					and recip_os.Org3Label = donor_os.Org3Label
					and recip_os.Org4Label = donor_os.Org4Label
				left join '+trim(@cRecipientTablePath)+'OrganizationType recip_ot on
					recip_ot.Code = donor_ot.Code
					and isnull(recip_ot.Description, '''') = isnull(donor_ot.Description, '''')
					and recip_ot.OrgLevel = donor_ot.OrgLevel
					and recip_ot.OrganizationStructureID = recip_os.ID

				left join '+trim(@cDonorTablePath)+'PositionType donor_pt on donor_pt.ID = donor_srfv.PositionTypeID
				left join '+trim(@cRecipientTablePath)+'PositionType recip_pt on
					isnull(recip_pt.Code, '''') = isnull(donor_pt.Code, '''')
					and isnull(recip_pt.Title, '''') = isnull(donor_pt.Title, '''')
					and isnull(recip_pt.Description, '''') = isnull(donor_pt.Description, '''')
					and isnull(recip_pt.Priority, -1) = isnull(donor_pt.Priority, -1)
					and coalesce(convert(nvarchar(255), recip_pt.ApprovedDate), ''NA'') = coalesce(convert(nvarchar(255), donor_pt.ApprovedDate), ''NA'')
					and coalesce(convert(nvarchar(255), recip_pt.EffectiveDate), ''NA'') = coalesce(convert(nvarchar(255), donor_pt.EffectiveDate), ''NA'')
					and coalesce(convert(nvarchar(255), recip_pt.ClosedDate), ''NA'') = coalesce(convert(nvarchar(255), donor_pt.ClosedDate), ''NA'')
					and recip_pt.CompanyID = recip_srf.CompanyID

				where donor_srf.CompanyID = '+@cDonorCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'SecEmployeeRecordFilterValue - F' as Insertdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%G%'
		begin
			-- step 1: update Description column on recipient SecPermission table with text so that they can be deleted
			select @cmdInsert = '
				update recip_sp
				set recip_sp.Description = ''DELETE_ME_'' + convert(nvarchar(max), '+@cRecipientCompany_ID+')
				from '+trim(@cRecipientTablePath)+'SecPermission recip_sp
				join '+trim(@cRecipientTablePath)+'SecPermissionRole recip_spr on recip_spr.PermissionID = recip_sp.ID
				join '+trim(@cRecipientTablePath)+'SecRole recip_sr on recip_sr.ID = recip_spr.RoleID
				where recip_sr.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'Update SecPermission rows in recipient to be deleted - G' as Insertdata
			end

			-- step 2: delete SecPermissionRole records from recipient db first to resolve reference constraint error
			select @cmdInsert = '
				delete recip_spr from '+trim(@cRecipientTablePath)+'SecPermissionRole recip_spr
				join '+trim(@cRecipientTablePath)+'SecRole recip_sr on recip_sr.ID = recip_spr.RoleID
				where recip_sr.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'Delete existing SecPermissionRole from recipient - G' as Insertdata
			end

			-- step 3: delete SecPermission records from recipient db using text stored in Description
			select @cmdInsert = '
				delete recip_sp from '+trim(@cRecipientTablePath)+'SecPermission recip_sp
				where recip_sp.Description = ''DELETE_ME_'' + convert(nvarchar(max), '+@cRecipientCompany_ID+')'

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'Delete existing SecPermission from recipient - G' as Insertdata
			end

			-- step 4: delete SecRole records from recip db
			select @cmdInsert = '
				delete recip_sr from '+trim(@cRecipientTablePath)+'SecRole recip_sr
				where recip_sr.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'Delete existing SecRole from recipient - G' as Insertdata
			end

			-- step 5: move SecRole records from donor to recip
			select @cmdInsert = '
				insert into '+trim(@cRecipientTablePath)+'SecRole
				(Name, Description, TenantId, RoleLevelID, CompanyID, ReadOnlyRoleLevelID, SecEmployeeRecordFilterID, BaseRoleID, IsBaseRole)
				select
					donor_sr.Name,
					donor_sr.Description,
					donor_sr.TenantId, -- can this be nulled out? is it ever used?
					recip_srl.ID as RoleLevelID,
					'+@cRecipientCompany_ID+' as CompanyID,
					recip_srl_readonly.ID as ReadOnlyRoleLevelID, 
					recip_srf.ID as SecEmployeeRecordFilterID,
					recip_sr_base.ID as BaseRoleID,
					donor_sr.IsBaseRole
				from '+trim(@cDonorTablePath)+'SecRole donor_sr

				left join '+trim(@cDonorTablePath)+'SecRoleLevel donor_srl on donor_srl.ID = donor_sr.RoleLevelID
				left join '+trim(@cRecipientTablePath)+'SecRoleLevel recip_srl on
					isnull(recip_srl.Description, '''') = isnull(donor_srl.Description, '''')
					and isnull(recip_srl.Level, 0) = isnull(donor_srl.Level, 0)
					and isnull(recip_srl.Name, '''') = isnull(donor_srl.Name, '''')

				left join '+trim(@cDonorTablePath)+'SecRoleLevel donor_srl_readonly on donor_srl_readonly.ID = donor_sr.ReadOnlyRoleLevelID
				left join '+trim(@cRecipientTablePath)+'SecRoleLevel recip_srl_readonly on
					isnull(recip_srl_readonly.Description, '''') = isnull(donor_srl_readonly.Description, '''')
					and isnull(recip_srl_readonly.Level, 0) = isnull(donor_srl_readonly.Level, 0)
					and isnull(recip_srl_readonly.Name, '''') = isnull(donor_srl_readonly.Name, '''')

				left join '+trim(@cDonorTablePath)+'SecEmployeeRecordFilter donor_srf on donor_srf.ID = donor_sr.SecEmployeeRecordFilterID
				left join '+trim(@cRecipientTablePath)+'SecEmployeeRecordFilter recip_srf on
					isnull(recip_srf.Name, '''') = isnull(donor_srf.Name, '''')
					and isnull(recip_srf.Description, '''') = isnull(donor_srf.Description, '''')
					and recip_srf.CompanyID = '+@cRecipientCompany_ID+'

				left join '+trim(@cDonorTablePath)+'SecRole donor_sr_base on donor_sr_base.ID = donor_sr.BaseRoleID
				left join '+trim(@cRecipientTablePath)+'SecRole recip_sr_base on
					isnull(recip_sr_base.Name, '''') = isnull(donor_sr_base.Name, '''')
					and isnull(recip_sr_base.Description, '''') = isnull(donor_sr_base.Description, '''')
					and isnull(recip_sr_base.IsBaseRole, 0) = isnull(donor_sr_base.IsBaseRole, 0)

				where donor_sr.CompanyID = '+@cDonorCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'Move SecRole - G' as Insertdata
			end

			-- step 6: move SecPermission associated with company roles from donor to recip
			select @cmdInsert = '
				insert into '+trim(@cRecipientTablePath)+'SecPermission
				(
					Name,
					Description,
					ResourceID,
					ResourceGroupID,
					ResourceSubGroupID,
					IsVisible,
					IsRead,
					IsCreate,
					IsUpdate,
					IsDelete,
					IsRequired,
					CddID,
					TableColumn,
					Category
				)
				select
					donor_sp.Name,
					donor_sp.Description,
					recip_src.ID as ResourceID,
					recip_srg.ID as ResourceGroupID,
					recip_srsg.ID as ResourceSubGroupID,
					donor_sp.IsVisible,
					donor_sp.IsRead,
					donor_sp.IsCreate,
					donor_sp.IsUpdate,
					donor_sp.IsDelete,
					donor_sp.IsRequired,
					recip_sc.ID as CddID,
					donor_sp.TableColumn,
					donor_sp.Category
				from '+trim(@cDonorTablePath)+'SecPermission donor_sp

				join '+trim(@cDonorTablePath)+'SecPermissionRole donor_spr on donor_spr.PermissionID = donor_sp.ID
				join '+trim(@cDonorTablePath)+'SecRole donor_sr on donor_sr.ID = donor_spr.RoleID

				join '+trim(@cDonorTablePath)+'SecResource donor_src on donor_src.ID = donor_sp.ResourceID
				left join '+trim(@cDonorTablePath)+'SecResourceGroup donor_src_srg on donor_src_srg.ID = donor_src.ResourceGroupID
				left join '+trim(@cRecipientTablePath)+'SecResourceGroup recip_src_srg on
					isnull(recip_src_srg.Name, '''') = isnull(donor_src_srg.Name, '''')
					and isnull(recip_src_srg.Description, '''') = isnull(donor_src_srg.Description, '''')
					and isnull(recip_src_srg.AlternateName, '''') = isnull(donor_src_srg.AlternateName, '''')
					and isnull(recip_src_srg.MainTableName, '''') = isnull(donor_src_srg.MainTableName, '''')
				join '+trim(@cRecipientTablePath)+'SecResource recip_src on
					isnull(recip_src.Name, '''') = isnull(donor_src.Name, '''')
					and isnull(recip_src.Description, '''') = isnull(donor_src.Description, '''')
					and recip_src.ResourceGroupID = recip_src_srg.ID

				left join '+trim(@cDonorTablePath)+'SecResourceGroup donor_srg on donor_srg.ID = donor_sp.ResourceGroupID
				left join '+trim(@cRecipientTablePath)+'SecResourceGroup recip_srg on
					isnull(recip_srg.Name, '''') = isnull(donor_srg.Name, '''')
					and isnull(recip_srg.Description, '''') = isnull(donor_srg.Description, '''')
					and isnull(recip_srg.AlternateName, '''') = isnull(donor_srg.AlternateName, '''')
					and isnull(recip_srg.MainTableName, '''') = isnull(donor_srg.MainTableName, '''')

				left join '+trim(@cDonorTablePath)+'SecResourceSubGroup donor_srsg on donor_srsg.ID = donor_sp.ResourceSubGroupID
				left join '+trim(@cDonorTablePath)+'SecResourceGroup donor_srsg_srg on donor_srsg_srg.ID = donor_srsg.ResourceGroupID
				left join '+trim(@cRecipientTablePath)+'SecResourceGroup recip_srsg_srg on
					isnull(recip_srsg_srg.Name, '''') = isnull(donor_srsg_srg.Name, '''')
					and isnull(recip_srsg_srg.Description, '''') = isnull(donor_srsg_srg.Description, '''')
					and isnull(recip_srsg_srg.MainTableName, '''') = isnull(donor_srsg_srg.MainTableName, '''')
					and isnull(recip_srsg_srg.AlternateName, '''') = isnull(donor_srsg_srg.AlternateName, '''')
				left join '+trim(@cRecipientTablePath)+'SecResourceSubGroup recip_srsg on
					isnull(recip_srsg.Name, '''') = isnull(donor_srsg.Name, '''')
					and isnull(recip_srsg.Description, '''') = isnull(donor_srsg.Description, '''')
					and isnull(recip_srsg.MainTableName, '''') = isnull(donor_srsg.MainTableName, '''')
					and recip_srsg.ResourceGroupID = recip_srsg_srg.ID

				left join '+trim(@cDonorTablePath)+'SecCDD donor_sc on donor_sc.ID = donor_sp.CddID
				left join '+trim(@cRecipientTablePath)+'SecCDD recip_sc on
					isnull(recip_sc.TableName, '''') = isnull(donor_sc.TableName, '''')
					and isnull(recip_sc.ColumnName, '''') = isnull(donor_sc.ColumnName, '''')
					and isnull(recip_sc.DataType, '''') = isnull(donor_sc.DataType, '''')
					and isnull(recip_sc.Length, -1) = isnull(donor_sc.Length, -1)
					and isnull(recip_sc.TableColumn, '''') = isnull(donor_sc.TableColumn, '''')

				where donor_sr.CompanyID = '+@cDonorCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'Move SecPermission under company roles - G' as Insertdata
			end

			-- step 6.5: move SecPermission records associated with company users from donor to recip
			select @cmdInsert = '
				insert into '+trim(@cRecipientTablePath)+'SecPermission
				(
					Name,
					Description,
					ResourceID,
					ResourceGroupID,
					ResourceSubGroupID,
					IsVisible,
					IsRead,
					IsCreate,
					IsUpdate,
					IsDelete,
					IsRequired,
					CddID,
					TableColumn,
					Category
				)
				select
					donor_sp.Name,
					donor_sp.Description,
					recip_src.ID as ResourceID,
					recip_srg.ID as ResourceGroupID,
					recip_srsg.ID as ResourceSubGroupID,
					donor_sp.IsVisible,
					donor_sp.IsRead,
					donor_sp.IsCreate,
					donor_sp.IsUpdate,
					donor_sp.IsDelete,
					donor_sp.IsRequired,
					recip_sc.ID as CddID,
					donor_sp.TableColumn,
					donor_sp.Category
				from '+trim(@cDonorTablePath)+'SecPermission donor_sp

				join '+trim(@cDonorTablePath)+'SecPermissionUser donor_spu on donor_spu.PermissionID = donor_sp.ID
				join '+trim(@cDonorTablePath)+'HRnextUser donor_u on donor_u.ID = donor_spu.UserID
				join '+trim(@cDonorTablePath)+'HRnextUserCompany donor_uc on donor_uc.HRnextUserID = donor_u.ID

				join '+trim(@cDonorTablePath)+'SecResource donor_src on donor_src.ID = donor_sp.ResourceID
				left join '+trim(@cDonorTablePath)+'SecResourceGroup donor_src_srg on donor_src_srg.ID = donor_src.ResourceGroupID
				left join '+trim(@cRecipientTablePath)+'SecResourceGroup recip_src_srg on
					isnull(recip_src_srg.Name, '''') = isnull(donor_src_srg.Name, '''')
					and isnull(recip_src_srg.Description, '''') = isnull(donor_src_srg.Description, '''')
					and isnull(recip_src_srg.AlternateName, '''') = isnull(donor_src_srg.AlternateName, '''')
					and isnull(recip_src_srg.MainTableName, '''') = isnull(donor_src_srg.MainTableName, '''')
				join '+trim(@cRecipientTablePath)+'SecResource recip_src on
					isnull(recip_src.Name, '''') = isnull(donor_src.Name, '''')
					and isnull(recip_src.Description, '''') = isnull(donor_src.Description, '''')
					and recip_src.ResourceGroupID = recip_src_srg.ID

				left join '+trim(@cDonorTablePath)+'SecResourceGroup donor_srg on donor_srg.ID = donor_sp.ResourceGroupID
				left join '+trim(@cRecipientTablePath)+'SecResourceGroup recip_srg on
					isnull(recip_srg.Name, '''') = isnull(donor_srg.Name, '''')
					and isnull(recip_srg.Description, '''') = isnull(donor_srg.Description, '''')
					and isnull(recip_srg.AlternateName, '''') = isnull(donor_srg.AlternateName, '''')
					and isnull(recip_srg.MainTableName, '''') = isnull(donor_srg.MainTableName, '''')

				left join '+trim(@cDonorTablePath)+'SecResourceSubGroup donor_srsg on donor_srsg.ID = donor_sp.ResourceSubGroupID
				left join '+trim(@cDonorTablePath)+'SecResourceGroup donor_srsg_srg on donor_srsg_srg.ID = donor_srsg.ResourceGroupID
				left join '+trim(@cRecipientTablePath)+'SecResourceGroup recip_srsg_srg on
					isnull(recip_srsg_srg.Name, '''') = isnull(donor_srsg_srg.Name, '''')
					and isnull(recip_srsg_srg.Description, '''') = isnull(donor_srsg_srg.Description, '''')
					and isnull(recip_srsg_srg.MainTableName, '''') = isnull(donor_srsg_srg.MainTableName, '''')
					and isnull(recip_srsg_srg.AlternateName, '''') = isnull(donor_srsg_srg.AlternateName, '''')
				left join '+trim(@cRecipientTablePath)+'SecResourceSubGroup recip_srsg on
					isnull(recip_srsg.Name, '''') = isnull(donor_srsg.Name, '''')
					and isnull(recip_srsg.Description, '''') = isnull(donor_srsg.Description, '''')
					and isnull(recip_srsg.MainTableName, '''') = isnull(donor_srsg.MainTableName, '''')
					and recip_srsg.ResourceGroupID = recip_srsg_srg.ID

				left join '+trim(@cDonorTablePath)+'SecCDD donor_sc on donor_sc.ID = donor_sp.CddID
				left join '+trim(@cRecipientTablePath)+'SecCDD recip_sc on
					isnull(recip_sc.TableName, '''') = isnull(donor_sc.TableName, '''')
					and isnull(recip_sc.ColumnName, '''') = isnull(donor_sc.ColumnName, '''')
					and isnull(recip_sc.DataType, '''') = isnull(donor_sc.DataType, '''')
					and isnull(recip_sc.Length, -1) = isnull(donor_sc.Length, -1)
					and isnull(recip_sc.TableColumn, '''') = isnull(donor_sc.TableColumn, '''')

				where donor_uc.CompanyID = '+@cDonorCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'Move SecPermission under company users - G' as Insertdata
			end

			-- step 7: move SecPermissionRole records from donor to recip
			select @cmdInsert = '
				insert into '+trim(@cRecipientTablePath)+'SecPermissionRole
				(
					PermissionID,
					RoleID
				)
				select
					recip_sp.ID as PermissionID,
					recip_sr.ID as RoleID
				from '+trim(@cDonorTablePath)+'SecPermissionRole donor_spr

				join '+trim(@cDonorTablePath)+'SecRole donor_sr on donor_sr.ID = donor_spr.RoleID
				join '+trim(@cDonorTablePath)+'SecPermission donor_sp on donor_sp.ID = donor_spr.PermissionID

				join '+trim(@cRecipientTablePath)+'SecRole recip_sr on
					isnull(recip_sr.Name, '''') = isnull(donor_sr.Name, '''')
					and isnull(recip_sr.Description, '''') = isnull(donor_sr.Description, '''')
					and isnull(recip_sr.TenantId, 0) = isnull(donor_sr.TenantId, 0)
				
				join '+trim(@cDonorTablePath)+'SecResource donor_src on donor_src.ID = donor_sp.ResourceID
				join '+trim(@cDonorTablePath)+'SecResourceGroup donor_srcg on donor_srcg.ID = donor_src.ResourceGroupID
				join '+trim(@cRecipientTablePath)+'SecResourceGroup recip_srcg on
					recip_srcg.Name = donor_srcg.Name
					and recip_srcg.Description = donor_srcg.Description
				join '+trim(@cRecipientTablePath)+'SecResource recip_src on
					recip_src.Name = donor_src.Name
					and recip_src.Description = donor_src.Description
					and recip_src.ResourceGroupID = recip_srcg.ID
				join '+trim(@cRecipientTablePath)+'SecPermission recip_sp on
					isnull(recip_sp.Name, '''') = isnull(donor_sp.Name, '''')
					and isnull(recip_sp.Description, '''') = isnull(donor_sp.Description, '''')
					and isnull(recip_sp.IsVisible, 0) = isnull(donor_sp.IsVisible, 0)
					and isnull(recip_sp.IsRead, 0) = isnull(donor_sp.IsRead, 0)
					and isnull(recip_sp.IsCreate, 0) = isnull(donor_sp.IsCreate, 0)
					and isnull(recip_sp.IsUpdate, 0) = isnull(donor_sp.IsUpdate, 0)
					and isnull(recip_sp.IsDelete, 0) = isnull(donor_sp.IsDelete, 0)
					and isnull(recip_sp.IsRequired, 0) = isnull(donor_sp.IsRequired, 0)
					and isnull(recip_sp.TableColumn, '''') = isnull(donor_sp.TableColumn, '''')
					and isnull(recip_sp.Category, '''') = isnull(donor_sp.Category, '''')
					and recip_sp.ResourceID = recip_src.ID

				where donor_sr.CompanyID = '+@cDonorCompany_ID+' and recip_sr.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'Move SecPermissionRole - G' as Insertdata
			end

			-- step 8: move SecPermissionUser records from donor to recip
			select @cmdInsert = '
				insert into '+trim(@cRecipientTablePath)+'SecPermissionUser
				(
					PermissionID,
					UserID
				)
				select
					recip_sp.ID as PermissionID,
					recip_hu.ID as UserID
				from '+trim(@cDonorTablePath)+'SecPermissionUser donor_spu

				join '+trim(@cDonorTablePath)+'HRnextUser donor_hu on donor_hu.ID = donor_spu.UserID
				join '+trim(@cDonorTablePath)+'HRnextUserCompany donor_huc on donor_huc.HRnextUserID = donor_hu.ID
				join '+trim(@cDonorTablePath)+'SecPermission donor_sp on donor_sp.ID = donor_spu.PermissionID

				join '+trim(@cRecipientTablePath)+'HRnextUser recip_hu on recip_hu.Username = donor_hu.Username collate Latin1_General_100_CS_AS
				join '+trim(@cRecipientTablePath)+'SecPermission recip_sp on
					isnull(recip_sp.Name, '''') = isnull(donor_sp.Name, '''')
					and isnull(recip_sp.Description, '''') = isnull(donor_sp.Description, '''')
					and isnull(recip_sp.IsVisible, 0) = isnull(donor_sp.IsVisible, 0)
					and isnull(recip_sp.IsRead, 0) = isnull(donor_sp.IsRead, 0)
					and isnull(recip_sp.IsCreate, 0) = isnull(donor_sp.IsCreate, 0)
					and isnull(recip_sp.IsUpdate, 0) = isnull(donor_sp.IsUpdate, 0)
					and isnull(recip_sp.IsDelete, 0) = isnull(donor_sp.IsDelete, 0)
					and isnull(recip_sp.IsRequired, 0) = isnull(donor_sp.IsRequired, 0)
					and isnull(recip_sp.TableColumn, '''') = isnull(donor_sp.TableColumn, '''')
					and isnull(recip_sp.Category, '''') = isnull(donor_sp.Category, '''')

				where donor_huc.CompanyID = '+@cDonorCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'Move SecPermissionUser - G' as Insertdata
			end

			-- step 9: move SecRoleUser records from donor to recip
			select @cmdInsert = '
				insert into '+trim(@cRecipientTablePath)+'SecRoleUser (RoleID, UserID)
				select recip_sr.ID as RoleID, recip_u.ID as UserID
				from '+trim(@cDonorTablePath)+'SecRoleUser donor_sru

				join '+trim(@cDonorTablePath)+'SecRole donor_sr on donor_sr.ID = donor_sru.RoleID
				join '+trim(@cRecipientTablePath)+'SecRole recip_sr on
					isnull(recip_sr.Name, '''') = isnull(donor_sr.Name, '''')
					and isnull(recip_sr.Description, '''') = isnull(donor_sr.Description, '''')
					and isnull(recip_sr.TenantId, 0) = isnull(donor_sr.TenantId, 0)

				join '+trim(@cDonorTablePath)+'HRnextUser donor_u on donor_u.ID = donor_sru.UserID
				join '+trim(@cRecipientTablePath)+'HRnextUser recip_u on recip_u.Username = donor_u.Username collate Latin1_General_100_CS_AS

				where donor_sr.CompanyID = '+@cDonorCompany_ID+' and recip_sr.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'Move SecRoleUser - G' as Insertdata
			end
		
			-- step 10: update SecRole names with recipient company code
			select @cmdInsert = '
				update recip_sr set recip_sr.Name = replace(recip_sr.Name, donor_c.PRIntegrationCompanyCode, recip_c.PRIntegrationCompanyCode)
				from '+trim(@cRecipientTablePath)+'SecRole recip_sr
				join '+trim(@cRecipientTablePath)+'Company recip_c on recip_c.ID = recip_sr.CompanyID
				join '+trim(@cDonorTablePath)+'Company donor_c on donor_c.ID = '+@cDonorCompany_ID+'
				where recip_sr.CompanyID = '+@cRecipientCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'Update SecRole names with recip company code - G' as Insertdata
			end

			if @cVerbose_Ind = 1
			begin
				select 'SecRole/SecPermission/SecPermissionRole/SecPermissionUser/SecRoleUser - G' as Insertdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%H%'
		begin
			select @cmdInsert = 'insert into '+trim(@cRecipientTablePath)+'UserCompanyTimeclockCredential (HRnextUserID, CompanyID, SC_AdminUsername, SC_AdminPassword, SC_SSOUsername, SC_SSOPassword, SC_SSOClockCard2, SC_SSOClockCard3)
			select R1.ID, '+@cRecipientCompany_ID+' as CompanyID, D1.SC_AdminUsername, SC_AdminPassword, SC_SSOUsername, SC_SSOPassword, SC_SSOClockCard2, SC_SSOClockCard3
			from '+trim(@cDonorTablePath)+'UserCompanyTimeclockCredential D1
			join '+trim(@cDonorTablePath)+'HRnextUser D2 on D1.HRnextUserID = D2.ID
			join '+trim(@cRecipientTablePath)+'HRnextUser R1 on D2.Username = R1.Username collate Latin1_General_100_CS_AS
			where D1.CompanyID = '+@cDonorCompany_ID

			exec (@cmdInsert)
			if @cShowStatement = 1
			begin
				select @cmdInsert
			end
			if @cVerbose_Ind = 1
			begin
				select 'Company TimeClock Credentials Update - H' as Insertdata
			end
		end

		if @cTableToRun = 'ZZZ' or @cTableToRun like '%I%'
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
				select 'Inactivate Users in Donor - I' as Insertdata
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
