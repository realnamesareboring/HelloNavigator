# Gemfile for Navigator's Codebook Jekyll Project

source "https://rubygems.org"

# Jekyll version
gem "jekyll", "~> 4.3.0"

# Essential Jekyll plugins
gem "jekyll-sass-converter", "~> 3.0"
gem "jekyll-feed", "~> 0.12"
gem "jekyll-sitemap", "~> 1.3"
gem "jekyll-seo-tag", "~> 2.6"

# Ruby 3.4+ compatibility - standard library gems that are no longer defaults
gem "csv"
gem "logger"
gem "ostruct"
gem "base64"

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# NOTE: wdm gem disabled due to Ruby 3.4.0 compatibility issues
# Performance-booster for watching directories on Windows
# gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]

# Lock `http_parser.rb` gem to `v0.6.x` on JRuby builds since newer versions of the gem
# do not have a Java counterpart.
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]

# Additional dependencies for development
group :development do
  gem "webrick", "~> 1.8"
end