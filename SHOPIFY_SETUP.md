# Shopify Setup Instructions

## Navigation Setup

To make the header navigation work properly in your Shopify store, you need to create the required pages and menu in Shopify Admin.

### 1. Create Pages in Shopify Admin

Go to **Online Store > Pages** and create the following pages:

#### About Page
- **Title**: About
- **Handle**: `about` (should be automatic)
- **Content**: Add your about content

#### Contact Page  
- **Title**: Contact
- **Handle**: `contact`
- **Content**: Add contact information and form

#### When to Use Page
- **Title**: When to Use
- **Handle**: `when-to-use`
- **Content**: Add product usage guidelines

#### Payment Page
- **Title**: Payment
- **Handle**: `payment`
- **Template**: Select "page.payment" from the template dropdown
- **Content**: This will use the custom payment template we created

### 2. Create Collections

Go to **Products > Collections**:

#### All Products Collection
- **Title**: All Products
- **Handle**: `all` or `all-products`
- **Type**: Automated
- **Conditions**: Product price is greater than 0 (to include all products)

### 3. Set Up Main Menu

Go to **Online Store > Navigation**:

1. **Edit the Main Menu** or create a new menu called "Main Menu"
2. **Add the following menu items**:
   - **Shop** → Link to "All Products" collection
   - **About** → Link to "About" page
   - **When to Use** → Link to "When to Use" page  
   - **Contact** → Link to "Contact" page
   - **Payment** → Link to "Payment" page

3. **Save the menu**
4. **Set it as the Main Menu** in the menu settings

### 4. Navigation Behavior

The theme navigation is smart and will:

1. **First try to use your Shopify Main Menu** if it exists
2. **Fall back to individual page detection** if no menu is set up
3. **Hide links to pages that don't exist** to prevent 404 errors

### 5. Cart and Account Links

These are automatically handled by Shopify:
- **Cart icon** → Links to `/cart` (Shopify cart page)
- **User icon** → Links to `/account` (Shopify customer account)
- **Cart count** → Shows actual cart item count from Shopify

## Troubleshooting Navigation Issues

### If navigation links don't work:

1. **Check page handles**: Make sure page handles match exactly:
   - `about`
   - `contact` 
   - `when-to-use`
   - `payment`

2. **Check collection handle**: The shop link looks for collection handle `all` or `all-products`

3. **Check menu setup**: If using Main Menu, ensure it's properly configured in Navigation settings

4. **Template assignment**: Make sure the payment page uses the `page.payment` template

### If pages show 404 errors:

1. **Verify pages are published** in Shopify Admin
2. **Check page visibility** settings
3. **Ensure handles are correct** and match the navigation code

### If payment page doesn't load correctly:

1. **Check template assignment** - page must use `page.payment` template
2. **Verify template files** are uploaded to theme
3. **Check for JavaScript errors** in browser console

## Advanced Customization

### To modify navigation in theme code:

Edit `layout/theme.liquid` in the navigation section. The theme uses:

- `{{ routes.collections_url }}` for collections
- `{{ pages['handle'].url }}` for pages  
- `{{ routes.cart_url }}` for cart
- `{{ routes.account_url }}` for account

### To add more navigation items:

1. **In Shopify Admin**: Add to Main Menu
2. **OR in theme code**: Add to the fallback navigation section in `theme.liquid`

## Testing

After setup:
1. **Preview your theme** to test navigation
2. **Check all links work** and go to correct pages
3. **Test on mobile** to ensure responsive behavior works
4. **Verify cart and account** functionality

The navigation should now work perfectly in your live Shopify store! 🎉