-- Add fund_strategy column
alter table properties add column fund_strategy text;

-- Update existing properties with fund alignment
update properties set fund_strategy = 'pheasant' where type = 'Long Term Hold';
update properties set fund_strategy = 'grouse' where type = 'Fix and Flip';
update properties set fund_strategy = 'pheasant' where type = 'Short Term Rental';

-- Expand the type check constraint
alter table properties drop constraint if exists properties_type_check;
alter table properties add constraint properties_type_check
  check (type in ('Long Term Hold', 'Fix and Flip', 'Short Term Rental',
                   'Cohabitation', 'Build to Rent', 'Development',
                   'Workforce Housing', 'Value Add'));
