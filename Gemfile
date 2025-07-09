source "https://rubygems.org"

# GitHub Pages gem - this controls all other versions
gem "github-pages", group: :jekyll_plugins

# Additional plugins (these are already included in github-pages)
group :jekyll_plugins do
  gem "jekyll-feed"
  gem "jekyll-sitemap"
  gem "jekyll-seo-tag"
end

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
gem "tzinfo-data", platforms: [:mingw, :mswin, :x64_mingw, :jruby]

# Note: Removed wdm gem due to Ruby 3.4.0 compatibility issues
# Jekyll will work fine without it, just slightly slower file watching