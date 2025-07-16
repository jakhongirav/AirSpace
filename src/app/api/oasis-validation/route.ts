import { NextRequest, NextResponse } from 'next/server';
import { oasisROFLService, PropertyData } from '@/services/oasisROFLService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'validate-price':
        return await handlePriceValidation(data);
      
      case 'batch-validate':
        return await handleBatchValidation(data);
      
      case 'market-insights':
        return await handleMarketInsights(data);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('ROFL API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handlePriceValidation(propertyData: PropertyData) {
  try {
    const startTime = Date.now();
    
    // Initialize ROFL service if needed
    console.log('🔐 Initializing Oasis ROFL service...');
    
    // Validate property in TEE
    console.log('⚡ Executing confidential computation in Trusted Execution Environment...');
    const validationResult = await oasisROFLService.validatePrice(propertyData);
    
    const processingTime = Date.now() - startTime;
    console.log(`✅ ROFL validation completed in ${processingTime}ms`);
    
    return NextResponse.json({
      success: true,
      data: validationResult,
      metadata: {
        roflAppId: 'airspace-price-validator',
        teeProvider: 'Oasis Sapphire',
        processingTime,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Price validation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Price validation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function handleBatchValidation(properties: PropertyData[]) {
  try {
    const startTime = Date.now();
    
    console.log(`🔐 Processing batch validation for ${properties.length} properties in ROFL TEE...`);
    
    const results = await oasisROFLService.getBatchValidation(properties);
    
    const processingTime = Date.now() - startTime;
    console.log(`✅ Batch validation completed in ${processingTime}ms`);
    
    return NextResponse.json({
      success: true,
      data: results,
      metadata: {
        propertiesProcessed: properties.length,
        averageProcessingTime: processingTime / properties.length,
        totalProcessingTime: processingTime,
        roflAppId: 'airspace-price-validator',
        teeProvider: 'Oasis Sapphire'
      }
    });
  } catch (error) {
    console.error('Batch validation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Batch validation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function handleMarketInsights(region: { lat: number; lng: number; radius: number }) {
  try {
    const startTime = Date.now();
    
    console.log('📊 Generating confidential market insights in ROFL TEE...');
    
    const insights = await oasisROFLService.getMarketInsights(region);
    
    const processingTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      data: insights,
      metadata: {
        region,
        processingTime,
        roflAppId: 'airspace-price-validator',
        teeProvider: 'Oasis Sapphire',
        dataConfidentiality: 'TEE-protected'
      }
    });
  } catch (error) {
    console.error('Market insights error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Market insights generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Oasis ROFL Price Validation API',
    version: '1.0.0',
    description: 'Confidential air rights price validation using Oasis Sapphire ROFL',
    endpoints: {
      'POST /': {
        'validate-price': 'Validate a single property price',
        'batch-validate': 'Validate multiple property prices',
        'market-insights': 'Get confidential market insights for a region'
      }
    },
    teeProvider: 'Oasis Sapphire',
    roflFramework: 'Runtime Off-chain Logic',
    confidentialityGuarantees: [
      'Proprietary algorithms protected in TEE',
      'Market data remains confidential',
      'Cryptographic proof of computation integrity'
    ]
  });
} 