CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles  -- SELECT list can be empty for this
      WHERE  rolname = 'apiUser') THEN
		-- Role: "apiUser"
		-- DROP ROLE "apiUser";

		CREATE ROLE "apiUser" WITH
		  LOGIN
		  NOSUPERUSER
		  INHERIT
		  NOCREATEDB
		  NOCREATEROLE
		  NOREPLICATION
		  ENCRYPTED PASSWORD '';
   END IF;
END
$do$;


-- Table: public.postalcodes

-- DROP TABLE public.postalcodes;

CREATE TABLE public.postalcodes
( 
    id SERIAL,
    countrycode character(2) COLLATE pg_catalog."default" NOT NULL,
    postalcode character varying(20) COLLATE pg_catalog."default" NOT NULL,
    placename character varying(180) COLLATE pg_catalog."default" NOT NULL,
    admin1name character varying(100) COLLATE pg_catalog."default",
    admin1code character varying(20) COLLATE pg_catalog."default",
    admin2name character varying(100) COLLATE pg_catalog."default",
    admin2code character varying(20) COLLATE pg_catalog."default",
    admin3name character varying(100) COLLATE pg_catalog."default",
    admin3code character varying(20) COLLATE pg_catalog."default",
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    accuracy smallint,
    coordinate geometry(Point,4326),
    CONSTRAINT postalcodes_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.postalcodes
    OWNER to "user";

GRANT ALL ON TABLE public.postalcodes TO "apiUser";

GRANT ALL ON TABLE public.postalcodes TO "user";
-- Index: idx_postalcodes

-- DROP INDEX public.idx_postalcodes;

CREATE INDEX idx_postalcodes
    ON public.postalcodes USING gist
    (coordinate)
    TABLESPACE pg_default;

ALTER TABLE public.postalcodes
    CLUSTER ON idx_postalcodes;