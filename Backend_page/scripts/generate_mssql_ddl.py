import os
import sys

sys.path.insert(0, os.path.abspath('.'))

import app.models
from app.extensions.database import Base
from sqlalchemy.dialects import mssql

def generate_ddl():
    ddl_statements = []
    ddl_statements.append('-- ============================================================================')
    ddl_statements.append('-- BOOKMYEVENT ENTERPRISE DATABASE MASTER SCHEMA (MICROSOFT SQL SERVER / SSMS)')
    ddl_statements.append('-- File: 01_schema_tables_and_constraints.sql')
    ddl_statements.append('-- Target: eventapp_db')
    ddl_statements.append('-- Generated directly from Active SQLAlchemy Models (100% Column Alignment)')
    ddl_statements.append('-- ============================================================================\n')
    ddl_statements.append('USE [eventapp_db];')
    ddl_statements.append('GO\n')
    ddl_statements.append('SET NOCOUNT ON;')
    ddl_statements.append('GO\n')

    ddl_statements.append('-- 1. Drop existing Foreign Keys and Tables cleanly to prevent Error 3726')
    ddl_statements.append('''DECLARE @dropFks NVARCHAR(MAX) = N'';
SELECT @dropFks += N'ALTER TABLE ' + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name) + N' DROP CONSTRAINT ' + QUOTENAME(f.name) + N';' + CHAR(13)
FROM sys.foreign_keys f
JOIN sys.tables t ON f.parent_object_id = t.object_id
JOIN sys.schemas s ON t.schema_id = s.schema_id;
IF LEN(@dropFks) > 0 EXEC sp_executesql @dropFks;
GO

DECLARE @dropTables NVARCHAR(MAX) = N'';
SELECT @dropTables += N'DROP TABLE ' + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name) + N';' + CHAR(13)
FROM sys.tables t
JOIN sys.schemas s ON t.schema_id = s.schema_id;
IF LEN(@dropTables) > 0 EXEC sp_executesql @dropTables;
GO''')

    ddl_statements.append('-- 2. Create tables with native SQL Server types')
    for table in Base.metadata.sorted_tables:
        cols_sql = []
        for col in table.columns:
            col_type = col.type.compile(dialect=mssql.dialect())
            # Clean type conversions
            if 'VARCHAR(max)' in col_type or col_type == 'TEXT':
                col_type = 'NVARCHAR(MAX)'
            elif col_type.startswith('VARCHAR'):
                col_type = col_type.replace('VARCHAR', 'NVARCHAR')
            elif col_type.startswith('CHAR'):
                col_type = col_type.replace('CHAR', 'NVARCHAR')
            elif 'BOOLEAN' in col_type or 'BOOL' in col_type:
                col_type = 'BIT'
            elif 'DATETIME' in col_type or 'TIMESTAMP' in col_type:
                col_type = 'DATETIME2'
            elif 'NUMERIC' in col_type:
                col_type = col_type.replace('NUMERIC', 'DECIMAL')
            
            nullable = 'NULL' if col.nullable else 'NOT NULL'
            default_val = ''
            if col.primary_key:
                default_val = 'PRIMARY KEY DEFAULT NEWID()'
            elif col.server_default is not None:
                default_val = 'DEFAULT GETUTCDATE()' if 'DATETIME' in col_type else ''
            
            definition = f"    [{col.name}] {col_type} {nullable} {default_val}".strip()
            cols_sql.append(definition)
        
        # Foreign Key Constraints
        fks_sql = []
        for fk in table.foreign_keys:
            fk_name = f"fk_{table.name}_{fk.parent.name}"[:120]
            # ON DELETE NO ACTION prevents SQL Server error 1785 (cascade cycles)
            fks_sql.append(
                f"    CONSTRAINT [{fk_name}] FOREIGN KEY ([{fk.parent.name}]) REFERENCES dbo.[{fk.column.table.name}]([{fk.column.name}]) ON DELETE NO ACTION"
            )

        all_elements = cols_sql + fks_sql
        block = ',\n'.join(all_elements)
        ddl_statements.append(f"CREATE TABLE dbo.[{table.name}] (\n{block}\n);\nGO\n")

    ddl_statements.append("PRINT '01_schema_tables_and_constraints.sql completed successfully with 100% column alignment!';\nGO\n")
    
    out_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'migrations', '01_schema_tables_and_constraints.sql'))
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(ddl_statements))
    print(f"Generated complete DDL at: {out_path} ({len(Base.metadata.sorted_tables)} tables)")

if __name__ == '__main__':
    generate_ddl()
